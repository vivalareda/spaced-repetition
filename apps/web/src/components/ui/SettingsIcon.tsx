"use client";

import { cn } from "@/lib/utils";
import type { HTMLMotionProps, Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

export interface SettingsIconHandle {
	startAnimation: () => void;
	stopAnimation: () => void;
}

interface SettingsIconProps extends HTMLMotionProps<"div"> {
	size?: number;
	speed?: number;
}

const SettingsIcon = forwardRef<SettingsIconHandle, SettingsIconProps>(
	(
		{ onMouseEnter, onMouseLeave, className, size = 28, speed = 1, ...props },
		ref,
	) => {
		const controls = useAnimation();
		const reduced = useReducedMotion();
		const isControlled = useRef(false);

		useImperativeHandle(ref, () => {
			isControlled.current = true;
			return {
				startAnimation: () =>
					reduced ? controls.start("normal") : controls.start("animate"),
				stopAnimation: () => controls.start("normal"),
			};
		});

		const handleEnter = useCallback(
			(e?: React.MouseEvent<HTMLDivElement>) => {
				if (reduced) return;
				if (!isControlled.current) controls.start("animate");
				else onMouseEnter?.(e as any);
			},
			[controls, reduced, onMouseEnter],
		);

		const handleLeave = useCallback(
			(e?: React.MouseEvent<HTMLDivElement>) => {
				if (!isControlled.current) controls.start("normal");
				else onMouseLeave?.(e as any);
			},
			[controls, onMouseLeave],
		);

		const groupSpin: Variants = {
			normal: { rotate: 0, scale: 1, y: 0 },
			animate: {
				rotate: [0, 16, 0],
				scale: [1, 1.06, 1],
				y: [0, -0.8, 0],
				transition: { duration: 0.9 * speed, ease: "easeInOut" },
			},
		};

		const gearDraw: Variants = {
			normal: { pathLength: 0, opacity: 1 },
			animate: {
				pathLength: 1,
				opacity: 1,
				transition: { duration: 0.7 * speed, ease: "easeInOut", delay: 0.06 },
			},
		};

		const coreDraw: Variants = {
			normal: { pathLength: 0, scale: 1, opacity: 1 },
			animate: {
				pathLength: 1,
				scale: [1, 1.08, 1],
				opacity: [1, 1, 1],
				transition: { duration: 0.6 * speed, ease: "easeInOut", delay: 0.26 },
			},
		};

		const tickSpark = (delay: number): Variants => ({
			normal: { opacity: 0, scale: 0.6 },
			animate: {
				opacity: [0, 1, 0],
				scale: [0.6, 1.25, 1],
				transition: { duration: 0.35 * speed, ease: "easeOut", delay },
			},
		});

		return (
			<motion.div
				className={cn("inline-flex items-center justify-center", className)}
				onMouseEnter={handleEnter}
				onMouseLeave={handleLeave}
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
					className="lucide lucide-settings-icon lucide-settings"
				>
					<motion.g variants={groupSpin} initial="normal" animate={controls}>
						<g>
							<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
							<circle cx="12" cy="12" r="3" />
						</g>

						<motion.path
							d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"
							pathLength={1}
							variants={gearDraw}
							initial="normal"
							animate={controls}
						/>
						<motion.circle
							cx="12"
							cy="12"
							r="3"
							pathLength={1}
							variants={coreDraw}
							initial="normal"
							animate={controls}
						/>

						<motion.circle
							cx="12"
							cy="4.6"
							r="0.8"
							fill="currentColor"
							variants={tickSpark(0.18)}
							initial="normal"
							animate={controls}
						/>
						<motion.circle
							cx="19"
							cy="8"
							r="0.7"
							fill="currentColor"
							variants={tickSpark(0.26)}
							initial="normal"
							animate={controls}
						/>
						<motion.circle
							cx="18.5"
							cy="16.5"
							r="0.7"
							fill="currentColor"
							variants={tickSpark(0.34)}
							initial="normal"
							animate={controls}
						/>
						<motion.circle
							cx="8"
							cy="18"
							r="0.7"
							fill="currentColor"
							variants={tickSpark(0.42)}
							initial="normal"
							animate={controls}
						/>
						<motion.circle
							cx="5.5"
							cy="9"
							r="0.7"
							fill="currentColor"
							variants={tickSpark(0.5)}
							initial="normal"
							animate={controls}
						/>
					</motion.g>
				</motion.svg>
			</motion.div>
		);
	},
);

SettingsIcon.displayName = "SettingsIcon";
export { SettingsIcon };
