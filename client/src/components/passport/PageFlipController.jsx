import { motion, AnimatePresence } from 'framer-motion';

export default function PageFlipController({ children, currentIndex, direction }) {
    // Determine flip direction.
    // direction > 0 means moving forward (flip left to right, old page goes out left)
    // For a real book feel:
    // Next page enters from right (rotateY 90 -> 0)
    // Prev page enters from left (rotateY -90 -> 0)

    const variants = {
        enter: (dir) => ({
            rotateY: dir > 0 ? 90 : -90,
            opacity: 0,
            boxShadow: "inset 0 0 50px rgba(0,0,0,0.5)"
        }),
        center: {
            zIndex: 1,
            rotateY: 0,
            opacity: 1,
            boxShadow: "inset 0 0 0px rgba(0,0,0,0)"
        },
        exit: (dir) => ({
            zIndex: 0,
            rotateY: dir < 0 ? 90 : -90,
            opacity: 0,
            boxShadow: "inset 0 0 50px rgba(0,0,0,0.5)"
        })
    };

    return (
        <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                    rotateY: { type: "spring", stiffness: 100, damping: 20 },
                    opacity: { duration: 0.2 },
                    boxShadow: { duration: 0.4 }
                }}
                style={{
                    position: 'absolute',
                    inset: 0,
                    transformOrigin: direction > 0 ? 'right center' : 'left center',
                    backfaceVisibility: 'hidden',
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
