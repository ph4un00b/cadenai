"use client";

import { useCallback, useRef } from "react";
import type { EditorFromTextArea } from "codemirror";
import type { CodemirrorBinding } from "y-codemirror";

import "codemirror/lib/codemirror.css";
import "./caret.css";
import CopyLink from "~/components/CopyLink";
import Title from "~/components/Title";
import { useAwareness, useText } from "~/lib/react-yjs";

if (typeof navigator !== "undefined") {
	// This accesses the global navigator, which is not available in SSR,
	// so we guard the import.
	require("codemirror/mode/javascript/javascript");
}

export function CodeEditor() {
	const yText = useText("text", { observe: "none" });
	const awareness = useAwareness();
	const editorRef = useRef<EditorFromTextArea | null>(null);
	const bindingRef = useRef<CodemirrorBinding | null>(null);

	const codeMirrorRef = useCallback(
		(ref: HTMLTextAreaElement | null) => {
			if (ref == null) {
				if (editorRef.current != null) {
					editorRef.current.toTextArea();
					editorRef.current = null;
				}

				if (bindingRef.current != null) {
					bindingRef.current.destroy();
					bindingRef.current = null;
				}

				return;
			}

			if (bindingRef.current !== null) {
				bindingRef.current.awareness = awareness;
				return;
			}

			// These libraries are designed to work in the browser, and will cause warnings
			// if imported on the server. Nextjs renders components on both the server and
			// the client, so we import them lazily here when they are used on the client.
			const CodeMirror = require("codemirror");
			const CodemirrorBinding = require("y-codemirror").CodemirrorBinding;

			editorRef.current = CodeMirror.fromTextArea(ref, {
				lineNumbers: true,
				mode: "javascript",
			});

			bindingRef.current = new CodemirrorBinding(
				yText!,
				editorRef.current,
				awareness,
			);
		},
		[awareness, yText],
	);

	return (
		<div className="space-y-4 p-4 lg:p-8">
			<Title>Code Editor</Title>
			<div>
				<textarea ref={codeMirrorRef} />
			</div>
			<CopyLink />
		</div>
	);
}
