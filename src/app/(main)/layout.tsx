import { Column, Mask, MatrixFx } from "@once-ui-system/core";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Column
        fillWidth
        maxHeight="100dvh"
        aspectRatio="1"
        horizontal="center"
        position="absolute"
        top="0"
        left="0"
      >
        <Mask maxWidth="m" x={50} y={0} radius={50}>
          <MatrixFx size={1.5} spacing={5} fps={24} colors={["brand-solid-strong"]} flicker />
        </Mask>
      </Column>
      {children}
    </>
  );
}
