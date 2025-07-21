import {
  DecoratorNode,
  type Spread,
} from 'lexical';
import type { JSX } from 'react';
import React from 'react';

type ImagePayload = {
  src: string;
  altText?: string;
  width?: number;
  height?: number;
  caption?: string;
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
      src,
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
  __caption: string;

  static getType() {
    return 'image';
  }

  static clone(node: ImageNode) {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__caption,
      node.__key,
    );
  }

  constructor(
    src: string,
    altText = '',
    width = 300,
    height = 0,
    caption = '',
    key?: string,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
    this.__caption = caption;
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span');
    return span;
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
    const { src, altText, width, height, caption } = serializedNode;
    return new ImageNode(src, altText, width, height, caption);
  }

  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      caption: this.__caption,
    };
  }

  isInline(): boolean {
    return false;
  }
}

// Helper
export function $createImageNode({
  src,
  altText = '',
  width = 300,
  height = 0,
  caption = '',
}: ImagePayload): ImageNode {
  return new ImageNode(src, altText, width, height, caption);
}

export function $isImageNode(node: unknown): node is ImageNode {
  return node instanceof ImageNode;
}
