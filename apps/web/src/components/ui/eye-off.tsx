'use client';
import type { Variants } from 'motion/react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { HTMLMotionProps } from 'motion/react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface EyeOffIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface EyeOffIconProps extends HTMLMotionProps<'div'> {
  size?: number;
  speed?: number;
}

const EyeOffIcon = forwardRef<EyeOffIconHandle, EyeOffIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, speed = 1, ...props }, ref) => {
    const controls = useAnimation();
    const reduced = useReducedMotion();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: () =>
          reduced ? controls.start('normal') : controls.start('animate'),
        stopAnimation: () => controls.start('normal'),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (reduced) return;
        if (!isControlledRef.current) {
          controls.start('animate');
        } else {
          onMouseEnter?.(e);
        }
      },
      [controls, reduced, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlledRef.current) {
          controls.start('normal');
        } else {
          onMouseLeave?.(e);
        }
      },
      [controls, onMouseLeave]
    );

    const iconVariants: Variants = {
      normal: { scale: 1 },
      animate: {
        scale: [1, 1.03, 1],
        transition: { duration: 0.5 * speed, ease: 'easeOut' },
      },
    };

    const pathVariants: Variants = {
      normal: { pathLength: 1, opacity: 1, pathOffset: 0 },
      animate: {
        pathLength: [0, 2],
        opacity: [0, 1],
        pathOffset: [0, 2],
        transition: { duration: 0.6 * speed },
      },
    };

    return (
      <motion.div
        className={cn('inline-flex items-center justify-center', className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={controls}
          initial="normal"
          variants={iconVariants}
        >
          <motion.path
            d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"
            initial="normal"
            animate={controls}
          />
          <motion.path
            d="M14.084 14.158a3 3 0 0 1-4.242-4.242"
            initial="normal"
            animate={controls}
          />
          <motion.path
            d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"
            initial="normal"
            animate={controls}
          />
          <motion.path
            d="m2 2 20 20"
            variants={pathVariants}
            initial="normal"
            animate={controls}
          />
        </motion.svg>
      </motion.div>
    );
  }
);

EyeOffIcon.displayName = 'EyeOffIcon';
export { EyeOffIcon };
