type IconProps = React.SVGProps<SVGSVGElement>;

/** Material "east" arrow — used in the CONTACT button (18×18 in the design). */
export function ArrowEast(props: IconProps) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M11.667 4.5 10.49 5.677l3.491 3.49H2v1.666h11.98l-3.49 3.49 1.177 1.177L17.167 10l-5.5-5.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
