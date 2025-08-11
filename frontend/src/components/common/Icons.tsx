interface IconProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  color?: string;
}

export const HamburgerIcon: React.FC<IconProps> = ({
  width = 30,
  height = 30,
  color = '#998FC7',
  className,
  ...props
}) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M3 6h18M3 12h18M3 18h18"
      stroke="#998FC7"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    className="mr-3"
    {...props}
  >
    <rect
      x="3"
      y="5"
      width="30"
      height="26"
      rx="8"
      stroke="#998FC7"
      strokeWidth="2"
    />
    <path
      d="M12 18l5 5 7-9"
      stroke="#998FC7"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  color = '#998FC7',
  className,
  ...props
}) => (
  <svg
    width={width}
    height={height}
    className={className}
    fill="none"
    stroke={color}
    strokeWidth={2}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M19 9l-7 7-7-7" />
  </svg>
);

export const ChevronUpIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  color = '#998FC7',
  className,
  ...props
}) => (
  <svg
    width={width}
    height={height}
    className={className}
    fill="none"
    stroke={color}
    strokeWidth={2}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M5 15l7-7 7 7" />
  </svg>
);

export const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-5 h-5 text-[#998FC7]',
  ...props
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export const VideoIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  color = '#998FC7',
  className,
  ...props
}) => (
  <svg
    width={width}
    height={height}
    className={className}
    fill="none"
    stroke={color}
    strokeWidth={2}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6h11a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
  </svg>
);

export const BookIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  color = '#998FC7',
  className,
  ...props
}) => (
  <svg
    width={width}
    height={height}
    className={className}
    fill="none"
    stroke={color}
    strokeWidth={2}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <path d="M17 21V13H7v8" />
    <path d="M7 3v5h8" />
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  color = '#FFA726',
  className,
  ...props
}) => (
  <svg
    width={width}
    height={height}
    className={className}
    fill="none"
    stroke={color}
    strokeWidth={2}
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 17.75l-6.172 3.245 1.179-6.873L2 9.755l6.908-1.004L12 2.5l3.092 6.251L22 9.755l-5.007 4.367 1.179 6.873z"
    />
  </svg>
);

export const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  width = 24,
  height = 24,
  color = '#998FC7',
  className,
  ...props
}) => (
  <svg
    width={width}
    height={height}
    className={className}
    fill="none"
    stroke={color}
    strokeWidth={2}
    viewBox="0 0 24 24"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    className="svg-icon"
    style={{
      width: '1em',
      height: '1em',
      verticalAlign: 'middle',
      fill: 'currentColor',
      overflow: 'hidden',
    }}
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M358.277408 561.800219c-0.596588 0.759293-1.193175 1.559519-1.461281 2.52245l-46.050826 168.836313c-2.685155 9.829879 0.065492 20.422122 7.342222 27.889187 5.442966 5.317099 12.614296 8.239662 20.252253 8.239662 2.52245 0 5.050016-0.301875 7.537673-0.962931l167.638021-45.722344c0.26913 0 0.399089 0.23536 0.601704 0.23536 1.925862 0 3.817955-0.700965 5.246491-2.161223l448.270537-448.205045c13.31526-13.332656 20.61655-31.494295 20.61655-51.254338 0-22.38994-9.496282-44.770669-26.126031-61.356416L919.809521 117.458155c-16.604166-16.629749-39.016619-26.143427-61.396325-26.143427-19.754926 0-37.915541 7.303336-51.264571 20.602224L358.944604 560.241724C358.478999 560.669466 358.609982 561.302893 358.277408 561.800219M923.791206 228.575906l-44.526099 44.49233-72.180949-73.327052 43.894719-43.895743c6.935969-6.973832 20.384259-5.956665 28.353768 2.041496l42.363853 42.402739c4.420683 4.41352 6.941086 10.289344 6.941086 16.099676C928.610978 221.151819 926.914336 225.473241 923.791206 228.575906M437.999101 568.842613l323.465043-323.483462 72.216765 73.376171-322.863339 322.847989L437.999101 568.842613 437.999101 568.842613zM379.065873 699.990558l23.375383-85.799108 62.352093 62.358233L379.065873 699.990558 379.065873 699.990558zM927.623487 406.192186c-16.968463 0-31.904641 13.796214-31.970132 30.994921l0 419.411255c0 21.913079-17.796318 38.907125-39.744189 38.907125L166.418752 895.505487c-21.914102 0-38.247092-16.991999-38.247092-38.907125L128.17166 166.360935c0-21.930475 16.331967-38.441521 38.247092-38.441521l473.184973 0c17.063631 0 30.908964-15.163351 30.908964-32.232099 0-17.034978-13.846356-31.68156-30.908964-31.68156L161.703357 64.005756c-53.42477 0-97.827049 44.216038-97.827049 97.67253l0 699.637518c0 53.458539 44.403303 98.422613 97.827049 98.422613l698.884364 0c53.463656 0 98.967012-44.964074 98.967012-98.422613l0-424.324148C959.489242 419.9884 944.587857 406.192186 927.623487 406.192186" />
  </svg>
);

export const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    className="w-24 h-24 text-gray-500"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M504 434.944L301.664 647.552l57.92 55.152L464 593.024V848h80V593.008l104.4 109.696 57.936-55.152L504 434.944z m265.68-82.112C733.6 220.896 614.88 128 476.96 128c-90.112 0-170.576 33.28-226.592 93.712-50.16 54.096-77.264 127.328-77.84 208.752C85.04 464.384 32 540.128 32 634.528 32 752.24 127.296 848 244.416 848H352v-80h-107.584C171.408 768 112 708.128 112 634.528c0-67.76 41.632-118.752 111.36-136.432l32.608-8.256-2.56-33.536c-5.52-72.688 13.712-135.008 55.632-180.208C349.728 232.16 409.36 208 476.96 208c108.928 0 201.648 79.04 220.448 187.92l5.312 30.704 31.04 2.384C838.72 437.056 912 506.768 912 598.544 912 691.984 836.656 768 744.032 768H656v80h88.032C880.768 848 992 736.096 992 598.544c0-126.128-89.984-223.728-222.32-245.712z"
      fill="#565D64"
    />
  </svg>
);

export const UploadAltIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => (
  <svg
    className="w-24 h-24 text-gray-400 mb-4"
    viewBox="0 0 1024 1024"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    strokeWidth={1}
    {...props}
  >
    <path d="M918.613333 305.066667a42.666667 42.666667 0 0 0-42.666666 0L725.333333 379.306667A128 128 0 0 0 597.333333 256H213.333333a128 128 0 0 0-128 128v256a128 128 0 0 0 128 128h384a128 128 0 0 0 128-123.306667l151.893334 75.946667A42.666667 42.666667 0 0 0 896 725.333333a42.666667 42.666667 0 0 0 22.613333-6.4A42.666667 42.666667 0 0 0 938.666667 682.666667V341.333333a42.666667 42.666667 0 0 0-20.053334-36.266666zM640 640a42.666667 42.666667 0 0 1-42.666667 42.666667H213.333333a42.666667 42.666667 0 0 1-42.666666-42.666667V384a42.666667 42.666667 0 0 1 42.666666-42.666667h384a42.666667 42.666667 0 0 1 42.666667 42.666667z m213.333333-26.453333l-128-64v-75.093334l128-64z" />
  </svg>
);

export const ProgressIcon: React.FC<IconProps> = ({
  width = 30,
  height = 30,
  color = '#998FC7',
  ...props
}) => (
  <svg
    width={width}
    height={height}
    className="h-12 w-12 mb-2 text-gray-700"
    fill="none"
    viewBox="0 0 48 48"
    stroke={color}
    strokeWidth={2.5}
    {...props}
  >
    <circle cx="24" cy="24" r="20" />
    <path d="M24 14v10l7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ContentIcon: React.FC<IconProps> = ({
  width = 30,
  height = 30,
  color = '#998FC7',
  ...props
}) => (
  <svg
    width={width}
    height={height}
    className="h-12 w-12 mb-2 text-gray-700"
    fill="none"
    viewBox="0 0 48 48"
    stroke={color}
    strokeWidth={2.5}
    {...props}
  >
    <path
      d="M6 12a4 4 0 0 1 4-4h14v32H10a4 4 0 0 1-4-4V12z"
      strokeLinejoin="round"
    />
    <path
      d="M42 12a4 4 0 0 0-4-4H24v32h14a4 4 0 0 0 4-4V12z"
      strokeLinejoin="round"
    />
  </svg>
);

export const GamifiedIcon: React.FC<IconProps> = ({
  width = 30,
  height = 30,
  color = '#998FC7',
  ...props
}) => (
  <svg
    width={width}
    height={height}
    className="h-12 w-12 mb-2 text-gray-700"
    fill="none"
    viewBox="0 0 48 48"
    stroke={color}
    strokeWidth={2.5}
    {...props}
  >
    <polygon
      points="24,6 29.4,18.3 42,18.3 32,27.1 36,39.7 24,32 12,39.7 16,27.1 6,18.3 18.6,18.3"
      strokeLinejoin="round"
    />
  </svg>
);

export const QuizIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    className="svg-icon"
    style={{
      width: '1em',
      height: '1em',
      verticalAlign: 'middle',
      fill: 'currentColor',
      overflow: 'hidden',
    }}
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M842.472727 51.2h-665.6c-69.818182 0-130.327273 60.509091-130.327272 130.327273v665.6c0 69.818182 60.509091 130.327273 130.327272 130.327272h665.6c74.472727 0 130.327273-55.854545 130.327273-130.327272V181.527273c0-74.472727-55.854545-130.327273-130.327273-130.327273z m60.509091 791.272727c0 32.581818-23.272727 55.854545-55.854545 55.854546h-665.6c-32.581818 0-55.854545-23.272727-55.854546-55.854546V181.527273c0-32.581818 23.272727-55.854545 55.854546-55.854546h665.6c32.581818 0 55.854545 23.272727 55.854545 55.854546v660.945454z" />
    <path d="M344.436364 260.654545l-60.509091 60.509091-27.927273-27.927272c-13.963636-13.963636-37.236364-13.963636-51.2 0-18.618182 13.963636-18.618182 37.236364 0 51.2l51.2 55.854545c9.309091 9.309091 18.618182 9.309091 27.927273 9.309091 9.309091 0 18.618182-4.654545 27.927272-9.309091l83.781819-88.436364c13.963636-13.963636 13.963636-37.236364 0-51.2-13.963636-13.963636-37.236364-13.963636-51.2 0zM344.436364 446.836364l-60.509091 65.163636-32.581818-32.581818c-13.963636-13.963636-37.236364-13.963636-51.2 0s-13.963636 37.236364 0 51.2l55.854545 55.854545c9.309091 9.309091 18.618182 9.309091 27.927273 9.309091 9.309091 0 18.618182-4.654545 23.272727-9.309091l88.436364-88.436363c13.963636-13.963636 13.963636-37.236364 0-51.2-13.963636-13.963636-37.236364-13.963636-51.2 0zM344.436364 633.018182l-60.509091 65.163636-32.581818-32.581818c-13.963636-13.963636-37.236364-13.963636-51.2 0s-13.963636 37.236364 0 51.2l55.854545 55.854545c9.309091 9.309091 18.618182 9.309091 27.927273 9.309091 9.309091 0 18.618182-4.654545 23.272727-9.309091l88.436364-88.436363c13.963636-13.963636 13.963636-37.236364 0-51.2-13.963636-13.963636-37.236364-13.963636-51.2 0zM772.654545 293.236364h-297.890909c-18.618182 0-37.236364 18.618182-37.236363 37.236363s18.618182 37.236364 37.236363 37.236364h297.890909c23.272727 0 37.236364-18.618182 37.236364-37.236364s-18.618182-37.236364-37.236364-37.236363zM772.654545 479.418182h-297.890909c-18.618182 0-37.236364 18.618182-37.236363 37.236363s18.618182 37.236364 37.236363 37.236364h297.890909c23.272727 0 37.236364-18.618182 37.236364-37.236364s-18.618182-37.236364-37.236364-37.236363zM772.654545 665.6h-297.890909c-18.618182 0-37.236364 18.618182-37.236363 37.236364s18.618182 37.236364 37.236363 37.236364h297.890909c23.272727 0 37.236364-18.618182 37.236364-37.236363s-18.618182-37.236364-37.236364-37.236364z" />
  </svg>
);

export const OpenBooksIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  color = '#998FC7',
  className,
  ...props
}) => (
  <svg
    width={width}
    height={height}
    className={className}
    stroke={color}
    fill="none"
    strokeWidth={2}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6.5C4 5 5.5 4 7 4c2.5 0 5 1 5 1v15s-2.5-1-5-1c-1.5 0-3-1-3-2.5V6.5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20 6.5C20 5 18.5 4 17 4c-2.5 0-5 1-5 1v15s2.5-1 5-1c1.5 0 3-1 3-2.5V6.5z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v15" />
  </svg>
);

export const PuzzleIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  color = '#998FC7',
  className,
  ...props
}) => (
  <svg
    width={width}
    height={height}
    className={className}
    stroke={color}
    fill="none"
    strokeWidth={2}
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 13v-2a2 2 0 00-2-2h-2V7a2 2 0 00-2-2h-2V3a2 2 0 00-2-2H7a2 2 0 00-2 2v2H3a2 2 0 00-2 2v2h2a2 2 0 012 2v2h2a2 2 0 012 2v2h2a2 2 0 012 2v2h2a2 2 0 002-2v-2h2a2 2 0 002-2z"
    />
  </svg>
);

export const QuestionIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  color = '#998FC7',
  className,
  ...props
}) => (
  <svg
    className={className}
    height={height}
    width={width}
    viewBox="0 0 73.9 73.9"
    xmlns="http://www.w3.org/2000/svg"
    stroke={color}
    strokeWidth={2}
    {...props}
  >
    <path
      d="m52.4 13.1h5.6v11.1h-5.6z"
      fill="none"
      transform="matrix(.7071 -.7071 .7071 .7071 2.9695 44.5346)"
    />
    <path d="m47.9 18.2-26.3 26.2v7.9h7.9l26.3-26.3z" fill="none" />
    <g fill={color}>
      <path d="m11.4 63.6h46.6c.6 0 1-.4 1-1v-26.4c0-.6-.4-1-1-1s-1 .4-1 1v25.4h-44.6v-44.6h25.4c.6 0 1-.4 1-1s-.4-1-1-1h-26.4c-.6 0-1 .4-1 1v46.6c0 .5.4 1 1 1z" />
      <path d="m47.2 16.1-27.3 27.2c-.2.2-.3.4-.3.7v9.3c0 .6.4 1 1 1h9.3c.3 0 .5-.1.7-.3l27.3-27.3 5.4-5.4c.4-.4.4-1 0-1.4l-9.3-9.3c-.4-.4-1-.4-1.4 0zm-17.7 36.2h-7.8v-7.9l26.3-26.3 7.8 7.8zm23.8-39.5 7.8 7.9-4 4-7.8-7.9z" />
    </g>
  </svg>
);

export const CheckAltIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => (
  <svg
    className="w-6 h-6"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    {...props}
  >
    <g>
      <path
        fill="currentColor"
        d="M42.4,10.7c-2.2,0.8-5,3.3-6.2,5.5l-1,1.9l-0.1,108.5c-0.1,81.4,0,109.2,0.4,111c0.4,2.1,0.9,2.9,2.9,4.9c1.5,1.5,3,2.5,4.2,2.9c2.7,0.8,168.1,0.8,170.7,0c2.4-0.7,5.3-3.2,6.5-5.6l1-1.9V128V18.1l-1-1.9c-1.3-2.4-4.2-4.9-6.5-5.6C210.8,9.7,44.6,9.8,42.4,10.7z M77.4,31.6c6.4,12.6,6.8,13.3,8.3,13.8c2.3,0.8,82.5,0.8,84.8,0c1.5-0.5,1.9-1.2,8.3-13.8l6.7-13.3h13.7h13.7V128v109.7h-84.8H43.3V128V18.3H57h13.7L77.4,31.6z M171.3,27.8l-4.7,9.4h-38.5H89.6l-4.7-9.4l-4.7-9.4h47.9H176L171.3,27.8z"
      />
      <path
        fill="currentColor"
        d="M162.9,120.2c-0.5,0.3-11.2,10.8-23.8,23.4l-22.9,22.9l-10.7-10.6c-5.9-5.9-11.2-10.9-11.8-11.2c-2.5-1.2-5.6,0.9-5.6,3.9c0,1.8,0.3,2.1,12.6,14.5c6.9,7,13.2,12.9,14.1,13.3c1.2,0.6,1.7,0.6,3,0c0.8-0.4,11.9-11.1,26.3-25.5c23.7-23.8,24.7-24.9,24.7-26.5C168.6,121.2,165.3,118.9,162.9,120.2z"
      />
    </g>
  </svg>
);

export const CircularProgressIcon: React.FC<
  { percentage?: number } & React.SVGProps<SVGSVGElement>
> = ({ percentage = 0, ...props }) => (
  <svg className="w-full h-full" viewBox="0 0 128 128" {...props}>
    <circle
      cx="64"
      cy="64"
      r="45"
      stroke="#D4C2FC"
      strokeWidth="10"
      fill="none"
    />
    <circle
      cx="64"
      cy="64"
      r="45"
      stroke="#FFA726"
      strokeWidth="10"
      fill="none"
      strokeDasharray={2 * Math.PI * 45}
      strokeDashoffset={(1 - percentage / 100) * 2 * Math.PI * 45}
      strokeLinecap="round"
      transform="rotate(-90 64 64)"
    />
  </svg>
);

export const VideoHeaderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => (
  <svg
    className="svg-icon"
    style={{
      width: '1em',
      height: '1em',
      verticalAlign: 'middle',
      fill: 'currentColor',
      overflow: 'hidden',
    }}
    viewBox="0 0 1024 1024"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M39.384615 1024V0h945.23077v1024H39.384615zM196.923077 78.769231H118.153846v78.769231h78.769231V78.769231z m0 157.538461H118.153846v78.769231h78.769231V236.307692z m0 157.538462H118.153846v78.769231h78.769231v-78.769231z m0 157.538461H118.153846v78.769231h78.769231v-78.769231z m0 157.538462H118.153846v78.769231h78.769231v-78.769231z m0 157.538461H118.153846v78.769231h78.769231v-78.769231zM748.307692 78.769231H275.692308v393.846154h472.615384V78.769231z m0 472.615384H275.692308v393.846154h472.615384V551.384615z m157.538462-472.615384h-78.769231v78.769231h78.769231V78.769231z m0 157.538461h-78.769231v78.769231h78.769231V236.307692z m0 157.538462h-78.769231v78.769231h78.769231v-78.769231z m0 157.538461h-78.769231v78.769231h78.769231v-78.769231z m0 157.538462h-78.769231v78.769231h78.769231v-78.769231z m0 157.538461h-78.769231v78.769231h78.769231v-78.769231z" />
  </svg>
);

export const VideoUploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => (
  <svg
    className="svg-icon"
    style={{
      width: '2em',
      height: '2em',
      verticalAlign: 'middle',
      overflow: 'hidden',
    }}
    viewBox="0 0 1024 1024"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    {...props}
  >
    <path
      d="M960 192h-28.384c-16.8 0-32.928 6.624-44.928 18.432L800 295.936V256a96 96 0 0 0-96-96H96C43.072 160 0 203.04 0 256v512a96 96 0 0 0 96 96h608c52.992 0 96-43.008 96-96v-39.072l86.688 85.504c12 11.808 28.128 18.432 44.928 18.432H960a64 64 0 0 0 64-64V256a64 64 0 0 0-64-64zM96 800c-17.664 0-32-14.368-32-32V256a32 32 0 0 1 32-32h608c17.632 0 32 14.336 32 32v512c0 17.632-14.368 32-32 32H96z m864-31.136h-32l-128-128V640l-32-32v-192l160-160h32v512.864z"
      className="text-gray-600"
      fill="currentColor"
    />
  </svg>
);

export const CorrectAnswerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => (
  <svg
    className="svg-icon"
    style={{
      width: '1.5em',
      height: '1.5em',
      verticalAlign: 'middle',
      fill: 'currentColor',
      overflow: 'hidden',
    }}
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M427.2128 661.1456l364.2368-380.5184a38.4 38.4 0 0 1 55.5008 53.1456l-392.0896 409.6a38.4 38.4 0 0 1-55.6032-0.1536l-222.3104-233.984a38.4 38.4 0 1 1 55.7056-52.9408l194.56 204.8512z" />
  </svg>
);

export const IncorrectAnswerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => (
  <svg
    className="svg-icon"
    style={{
      width: '1.5em',
      height: '1.5em',
      verticalAlign: 'middle',
      fill: 'currentColor',
      overflow: 'hidden',
    }}
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M801.62816 222.37184a30.72 30.72 0 0 1 0 43.43808L555.43808 512l246.19008 246.21056a30.72 30.72 0 1 1-43.43808 43.43808L512 555.43808 265.8304 801.62816a30.72 30.72 0 1 1-43.45856-43.43808L468.54144 512l-246.1696-246.1696a30.72 30.72 0 1 1 43.43808-43.45856L512 468.54144l246.21056-246.1696a30.72 30.72 0 0 1 43.43808 0z" />
  </svg>
);

export const ReOrderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    className="svg-icon"
    style={{
      width: '1.5em',
      height: '1.5em',
      verticalAlign: 'middle',
      fill: 'currentColor',
      overflow: 'hidden',
    }}
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M128 640h768v-85.333333H128v85.333333m0 170.666667h768v-85.333334H128v85.333334m0-341.333334h768V384H128v85.333333m0-256v85.333334h768V213.333333H128z"
      fill=""
    />
  </svg>
);

export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  width = 24,
  height = 24,
  color = '#998FC7',
  className,
  ...props
}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const RemoveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors duration-200"
    {...props}
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const ArticleIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  color = '#998FC7',
  className,
  ...props
}) => (
  <svg
    width={width}
    height={height}
    className={className}
    fill="none"
    stroke={color}
    strokeWidth={2}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M4 4h16v16H4z" strokeLinejoin="round" />
    <path d="M8 8h8M8 12h6M8 16h4" strokeLinecap="round" />
  </svg>
);
