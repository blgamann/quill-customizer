import { Quill } from "react-quill";

const ImageBlot = Quill.import("formats/image");

export class CustomImageBlot extends ImageBlot {
  static blotName = "customImage";
  static tagName = "img";

  static create(value: string) {
    const node = super.create(value);
    node.setAttribute("src", value);
    node.classList.add("custom-image");

    node.addEventListener("click", (e: MouseEvent) => {
      console.log("click");
      e.preventDefault();
      e.stopPropagation();

      const prevSelected = document.querySelector(".ql-editor img.selected");
      if (prevSelected) {
        prevSelected.classList.remove("selected");
      }
      node.classList.add("selected");
    });
    return node;
  }
}
