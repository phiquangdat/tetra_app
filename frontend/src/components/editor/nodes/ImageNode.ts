import {
  DecoratorNode,
  type Spread,
  type DOMExportOutput,
  type DOMConversionMap,
  type NodeKey,
} from 'lexical';
import type { JSX } from 'react';
import React from 'react';

type ImagePayload = {
  src: string;
  altText?: string;
  width?: number;
  height?: number;
};

type SerializedImageNode = Spread<
  {
    type: 'image';
    version: 1;
  },
  ImagePayload
>;

function ImageComponent({
  src,
  altText,
  width,
}: Pick<ImagePayload, 'src' | 'altText' | 'width'>) {
  return React.createElement(
    'figure',
    { className: 'my-4' },
    React.createElement('img', {
      src: src,
      alt: altText,
      style: { maxWidth: `${width}px`, width: '100%', height: 'auto' },
      className: 'rounded max-w-full mx-auto',
    })
  );
}

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width: number;
  __height: number;

  static getType() {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__key,
    );
  }

  constructor(
    src: string,
    altText = '',
    width = 300,
    height = 0,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
  }

  createDOM(): HTMLElement {
    return document.createElement('span');
  }

  updateDOM(): false {
    return false;
  }

  decorate(): JSX.Element {
    return React.createElement(ImageComponent, {
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
    });
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, altText, width, height } = serializedNode;
    return new ImageNode(src, altText, width, height);
  }

  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
    };
  }

  exportDOM(): DOMExportOutput {
    const img = document.createElement('img');
    img.src = this.__src;
    img.alt = this.__altText;
    img.style.maxWidth = `${this.__width}px`;
    img.style.width = '100%';
    img.style.height = 'auto';
    img.className = 'rounded max-w-full mx-auto';

    const figure = document.createElement('figure');
    figure.className = 'my-4';
    figure.appendChild(img);

    return { element: figure };
  }

  static importDOM(): DOMConversionMap {
    return {
      figure: (domNode: HTMLElement) => {
        const img = domNode.querySelector('img');
        if (!img || !img.src) return null;

        return {
          conversion: () => ({
            node: new ImageNode(
              img.src,
              img.alt || '',
              parseInt(img.style.maxWidth || '300', 10),
              img.naturalHeight || 0,
            ),
          }),
          priority: 1,
        };
      },
    };
  }

  isInline(): boolean {
    return false;
  }
}

// Helpers
export function $createImageNode({
  src,
  altText = '',
  width = 300,
  height = 0,
}: ImagePayload): ImageNode {
  return new ImageNode(src, altText, width, height);
}

export function $isImageNode(node: unknown): node is ImageNode {
  return node instanceof ImageNode;
}
