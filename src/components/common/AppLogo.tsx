import Image from "next/image";

type Props = {
  logoBase64?: string;
  namaRS?: string;
  size?: number;
  className?: string;
};

export default function AppLogo({
  logoBase64,
  namaRS = "Sistem Antrian",
  size = 40,
  className = "",
}: Props) {
  if (logoBase64) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoBase64}
        alt={namaRS}
        width={size}
        height={size}
        style={{ objectFit: "contain", width: size, height: size }}
        className={className}
      />
    );
  }

  // SVG default
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="40" height="40" rx="10" fill="rgba(255,255,255,0.15)" />
      <path
        d="M20 8L8 16V32H16V24H24V32H32V16L20 8Z"
        fill="white"
        fillOpacity="0.9"
      />
      <rect x="17" y="12" width="6" height="6" rx="1" fill="#006565" />
    </svg>
  );
}
