export class ElementBuilder {
  static create(tag, { id, className, textContent } = {}) {
    const element = document.createElement(tag);
    if (id) element.id = id;
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
  }
}
