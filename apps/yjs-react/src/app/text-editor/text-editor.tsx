"use client";

import { useEffect, useRef } from "react";
import { QuillBinding } from "y-quill";

import "quill/dist/quill.snow.css";
import { useState } from "react";
import { LinkIcon } from "@heroicons/react/24/outline";
import { useAwareness, useText } from "@y-sweet/react";

export function TextEditor() {
	const yText = useText("text", { observe: "none" });
	const awareness = useAwareness();
	const editorRef = useRef<HTMLDivElement | null>(null);
	const bindingRef = useRef<QuillBinding | null>(null);

	useEffect(() => {
		if (bindingRef.current !== null) {
			return;
		}
		if (editorRef.current && awareness) {
			// These libraries are designed to work in the browser, and will cause warnings
			// if imported on the server. Nextjs renders components on both the server and
			// the client, so we import them lazily here when they are used on the client.
			const Quill = require("quill");
			const QuillCursors = require("quill-cursors");

			Quill.register("modules/cursors", QuillCursors);
			const quill = new Quill(editorRef.current, {
				theme: "snow",
				placeholder: "Start collaborating...",
				modules: {
					cursors: true,
					toolbar: [
						[{ header: [1, 2, false] }],
						["bold", "italic", "underline"],
						[{ list: "ordered" }],
						["link"],
					],
				},
			});
			bindingRef.current = new QuillBinding(yText!, quill, awareness!);
		}
	}, [yText, awareness]);
	// }, []);

	return (
		<div className="space-y-3 p-4 sm:p-8">
			<h1>A Collaborative Text Editor</h1>
			<div className="bg-white/90">
				<div ref={editorRef} />
			</div>
			<CopyLink />
		</div>
	);
}

function CopyLink() {
	const [copied, setCopied] = useState(false);

	const copyLinkToClipboard = () => {
		const currentPageURL = window.location.href;

		navigator.clipboard
			.writeText(currentPageURL)
			.then(() => {
				setCopied(true);
			})
			.catch((error) => {
				console.error("Failed to copy link: ", error);
			});
	};

	return (
		<div className="flex items-center pt-6 text-left text-neutral-500">
			<span className="pr-2">Share this document</span>
			<button
				className="flex items-center gap-1 rounded-lg border border-white bg-neutral-50 px-2 py-1 text-sm transition-all hover:bg-white"
				onClick={copyLinkToClipboard}
			>
				<LinkIcon className="h-3 w-3" />
				{copied ? "Copied!" : "Copy Link"}
			</button>
		</div>
	);
}
