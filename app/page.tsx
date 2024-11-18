"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import "react-quill/dist/quill.snow.css";
import "./quill.css";

// TODO: import dynamically
import { CustomImageBlot } from "./blots/image-blot";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

// keyboard handlers
const markdownHeaderBinding = {
  key: " ",
  handler(range: any, context: any) {
    console.log("space");

    const { index } = range;
    // Get the current line and its offset
    const [line, offset] = this.quill.getLine(index);
    const lineStart = index - offset;
    // Get the text from the start of the line up to the cursor
    const lineText = this.quill.getText(lineStart, offset);
    // Match for leading '#' symbols (up to 6) possibly with leading whitespace

    const match = lineText.match(/^(\s*)(#{1,6})$/);
    if (match) {
      const leadingWhitespace = match[1];
      const hashes = match[2];
      const level = hashes.length;

      // Delete the '#' symbols and any leading whitespace
      this.quill.deleteText(lineStart, offset);
      // Format the line as a header of the appropriate level
      this.quill.formatLine(lineStart, 1, "header", level);
      // Set the cursor at the start of the line
      this.quill.setSelection(lineStart, 0);
      return false; // Prevent the default space insertion
    } else {
      // Insert the space as normal
      this.quill.insertText(index, " ", "user");
      this.quill.setSelection(index + 1, 0);
      return true;
    }
  },
};

const markdownHeaderCancelBinding = {
  key: "Backspace",
  handler(range: any, context: any) {
    // TODO...
  },
};

// toolbar handlers
const imageHandler = function () {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");
  input.click();
  input.onchange = () => {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const range = this.quill.getSelection();
        this.quill.insertEmbed(
          range.index,
          "customImage",
          e.target.result,
          "user"
        );
      };
      reader.readAsDataURL(file);
    }
  };
};

export default function Home() {
  const [value, setValue] = useState("");

  useEffect(() => {
    const Quill = require("react-quill").Quill;
    const ImageBlot = Quill.import("formats/image");

    class CustomImageBlot extends ImageBlot {
      static create(value) {
        const node = super.create(value);
        node.setAttribute("src", value);
        node.classList.add("custom-image");

        node.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          const prevSelected = document.querySelector(
            ".ql-editor img.selected"
          );
          if (prevSelected) {
            prevSelected.classList.remove("selected");
          }
          node.classList.add("selected");
        });

        return node;
      }
    }
    CustomImageBlot.blotName = "customImage";
    CustomImageBlot.tagName = "img";
    Quill.register(CustomImageBlot);
  }, []);

  const modules = useMemo(() => {
    return {
      toolbar: {
        container: [
          ["bold", "italic", "underline", "strike"],
          [{ header: [1, 2, 3, false] }],
          ["image"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      keyboard: {
        bindings: {
          markdownHeaderBinding,
          markdownHeaderCancelBinding,
        },
      },
    };
  }, []);

  return (
    <div className="flex justify-center items-center pt-56">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={setValue}
        modules={modules}
      />
    </div>
  );
}
