import { Children, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./Marquee.module.scss";

type MarqueeProps = {
  children: ReactNode;
  className?: string;
  // Speed controls the velocity in which the marquee animates
  speed?: number;
  // The delay it should take to the marque to start to animate
  delaySeconds?: number;
};

const Spacer = () => <span className={styles.spacer} />;

function Marquee(props: MarqueeProps) {
  const { children, className, speed = 60, delaySeconds = 0 } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [marqueeWidth, setMarqueeWidth] = useState(0);

  const isMarqueeWiderThanContainer = useMemo(() => marqueeWidth > containerWidth, [marqueeWidth, containerWidth]);

  // Check if the marquee is dynamic
  const isDynamic = useMemo(
    () => Children.count(children) > 1 || isMarqueeWiderThanContainer,
    [children, isMarqueeWiderThanContainer]
  );

  // The animation duration the marquee should run
  const duration = useMemo(() => {
    return marqueeWidth < containerWidth ? containerWidth / speed : marqueeWidth / speed;
  }, [containerWidth, marqueeWidth, speed]);

  // Play state of the marquee
  const playState = useMemo(() => (isDynamic ? "running" : "paused"), [isDynamic]);

  // Calculate the width of both marquee and container
  const calculateWidth = useCallback(() => {
    if (marqueeRef.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const marqueeRect = marqueeRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const marqueeWidth = marqueeRect.width;

      setContainerWidth(containerWidth);
      setMarqueeWidth(marqueeWidth);
    }
  }, []);

  // Marquee animation style set
  const marqueeStyle = useMemo(
    () => ({
      ["animation-name"]: styles["animate-marquee"],
      ["animation-duration"]: `${duration}s`,
      ["animation-delay"]: `${delaySeconds}s`,
      ["animation-timing-function"]: "linear",
      ["animation-direction"]: "normal",
      ["animation-iteration-count"]: "infinite",
      ["animation-play-state"]: playState,
    }),
    [playState, duration, delaySeconds]
  );

  // Render marquee child
  const renderChild = useCallback(
    (child: ReactNode) => {
      return (
        <>
          <div className={styles["marquee-child"]}>{child}</div>
          {isDynamic ? <Spacer /> : null}
        </>
      );
    },
    [isDynamic]
  );

  // Calculate width and multiplier on mount and on window resize
  useEffect(() => {
    calculateWidth();

    if (marqueeRef.current && containerRef.current) {
      window.addEventListener("resize", calculateWidth);

      const resizeObserver = new ResizeObserver(calculateWidth);
      resizeObserver.observe(containerRef.current);
      resizeObserver.observe(marqueeRef.current);
      return () => {
        window.removeEventListener("resize", calculateWidth);

        if (!resizeObserver) return;
        resizeObserver.disconnect();
      };
    }
  }, [calculateWidth]);

  // Apply marquee style to the marquee nodes
  useEffect(() => {
    const queryKey = `div.${styles["marquee"]}`;
    const marqueeNodes: NodeListOf<HTMLDivElement> | undefined = containerRef.current?.querySelectorAll(queryKey);

    // Programmatically apply style to the marquee nodes to comply with CSP policy
    for (const marqueeNode of Array.from(marqueeNodes || [])) {
      Object.entries(marqueeStyle).forEach(([key, value]) => {
        // Style cannot be applied with setAttributed due to CSP policy
        marqueeNode.style[key as unknown as number] = value as string;
      });
    }
  }, [marqueeStyle]);

  return (
    <div key={String(isDynamic)} ref={containerRef} className={`${styles["marquee-container"]} ${className}`}>
      <div className={styles["marquee"]}>
        <div ref={marqueeRef} className={styles["marquee-initial-child-container"]}>
          {Children.map(children, renderChild)}
        </div>
      </div>
      <div className={styles["marquee"]}>{Children.map(children, renderChild)}</div>
    </div>
  );
}

export default Marquee;
