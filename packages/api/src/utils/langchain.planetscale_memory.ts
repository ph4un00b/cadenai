import { Client, type Config, type Connection } from "@planetscale/database";
import {
	BaseChatMemory,
	getBufferString,
	type BaseChatMemoryInput,
} from "langchain/memory";

import "@total-typescript/ts-reset";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export type InputValues = Record<string, unknown>;
export type OutputValues = Record<string, unknown>;
export type MemoryVariables = Record<string, unknown>;

export interface MySQLMemoryMessage {
	role: string;
	content: string;
}

export type MySQLMemoryInput = BaseChatMemoryInput & {
	sessionId: string;
	LLM?: string;
	memoryTable?: string;
	memoryTTL?: number;
};

const schema = z.array(z.object({ role: z.string(), content: z.string() }));

export class MySQLMemory extends BaseChatMemory {
	private readonly db: Connection;
	private readonly memoryTable: string;
	private readonly LLM: string;
	private readonly sessionId: string;
	private readonly memoryTTL: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private readonly memorySchema: z.ZodObject<any, any, any, any>;

	constructor(configOpts: Config, readonly fields: MySQLMemoryInput) {
		const {
			memoryTable = "ChatHistoryLLM",
			LLM = "OpenAI",
			sessionId,
			memoryTTL = 3000,
			...rest
		} = fields;
		super(rest);

		this.memoryTable = memoryTable;
		this.LLM = LLM;
		this.sessionId = sessionId;
		this.memoryTTL = memoryTTL;

		this.memorySchema = z.object({
			sessionId: z.enum(["varchar"]),
			role: z.enum(["enum"]),
			llm: z.enum(["enum"]),
			content: z.enum(["text"]),
			createdAt: z.enum(["datetime"]),
			finishedAt: z.enum(["datetime"]),
			updatedAt: z.enum(["timestamp"]),
		});

		this.db = new Client({
			host: configOpts.host,
			username: configOpts.username,
			password: configOpts.password,
		}).connection();
		console.log("contructor-end");
	}

	get memoryKeys() {
		return ["history"];
	}
	// +---------------+---------------+-----------------+-------------+------------------+----------------+-------------+-----------+--------------------------+------------------------+-------------------+---------------+--------------------+--------------------+--------------------+-----------------+------------+----------------+---------------------------------+----------------+-----------------------+--------+
	// | TABLE_CATALOG | TABLE_SCHEMA  | TABLE_NAME      | COLUMN_NAME | ORDINAL_POSITION | COLUMN_DEFAULT | IS_NULLABLE | DATA_TYPE | CHARACTER_MAXIMUM_LENGTH | CHARACTER_OCTET_LENGTH | NUMERIC_PRECISION | NUMERIC_SCALE | DATETIME_PRECISION | CHARACTER_SET_NAME | COLLATION_NAME     | COLUMN_TYPE     | COLUMN_KEY | EXTRA          | PRIVILEGES                      | COLUMN_COMMENT | GENERATION_EXPRESSION | SRS_ID |
	// +---------------+---------------+-----------------+-------------+------------------+----------------+-------------+-----------+--------------------------+------------------------+-------------------+---------------+--------------------+--------------------+--------------------+-----------------+------------+----------------+---------------------------------+----------------+-----------------------+--------+
	// | def           | flux-database | TableName	     | id          |                1 | NULL           | NO          | bigint    |                     NULL |                   NULL |                20 |             0 |               NULL | NULL               | NULL               | bigint unsigned | PRI        | auto_increment | select,insert,update,references |                |                       |   NULL |
	// +---------------+---------------+-----------------+-------------+------------------+----------------+-------------+-----------+--------------------------+------------------------+-------------------+---------------+--------------------+--------------------+--------------------+-----------------+------------+----------------+---------------------------------+----------------+-----------------------+--------+
	async init() {
		try {
			const { rows } = await this.db.execute(
				`SELECT COLUMN_NAME, DATA_TYPE
				FROM information_schema.columns
				WHERE table_schema = DATABASE() AND table_name = ?
				`,
				[this.memoryTable],
			);

			const data = {};
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			for (const { COLUMN_NAME, DATA_TYPE } of rows) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
				data[COLUMN_NAME] = DATA_TYPE;
			}

			this.memorySchema.parse(data);
		} catch (err) {
			console.error("❌", err);
			throw new TRPCError({
				code: "CONFLICT",
				cause: err,
				message: "memory-db-error",
			});
		}

		try {
			const { rows } = await this.db.execute(
				`
				-- select * from ChatHistoryLLM where sessionId = "user-id" order by id desc;
				SELECT * FROM ${this.memoryTable} WHERE sessionId = ? ORDER BY id DESC
				`,
				[this.sessionId],
			);

			const messages = schema.parse(rows);
			console.log(`✅ Retrieved ${messages.length} messages from MySQL.`);
			this.buildHistory(messages);
		} catch (error) {
			console.error(`❌ Failed to retrieve chat history from MySQL. ${error}`);
			throw new Error(`❌ ${error}`);
		}
	}

	private buildHistory(messages: ReadonlyArray<MySQLMemoryMessage>) {
		messages.forEach((message) => {
			const add =
				message.role === "AI"
					? this.chatHistory.addAIChatMessage.bind(this.chatHistory)
					: this.chatHistory.addUserMessage.bind(this.chatHistory);

			add(message.content).catch((error: Error) =>
				console.error(`❌ Error adding ${message.role} message. ${error}`),
			);
		});
	}

	async loadMemoryVariables(_values: InputValues) {
		const messages = await this.chatHistory.getMessages();
		if (this.returnMessages) return { history: messages };
		return { history: getBufferString(messages) };
	}

	async saveContext(inputValues: InputValues, outputValues: OutputValues) {
		console.log("⏰ saving", [inputValues, outputValues]);

		try {
			await this.db.execute(
				`INSERT INTO ${this.memoryTable} (sessionId, role, content)
				VALUES (?, ?, ?), (?, ?, ?)`,
				[
					this.sessionId,
					"Human",
					inputValues.input,
					this.sessionId,
					"AI",
					outputValues.response,
				],
			);
			// await this.db.execute(
			// 	`DELETE FROM ${this.memoryTable} WHERE sessionId = ? AND createdAt < NOW() - INTERVAL ? SECOND`,
			// 	[this.sessionId, this.memoryTTL],
			// );
			await super.saveContext(inputValues, outputValues);
		} catch (error) {
			console.log(`❌ ${error}`);
			throw new TRPCError({
				code: "CONFLICT",
				cause: error,
				message: "memory-db-insert-error",
			});
		}
		console.log("✅ saved!");
	}
}
