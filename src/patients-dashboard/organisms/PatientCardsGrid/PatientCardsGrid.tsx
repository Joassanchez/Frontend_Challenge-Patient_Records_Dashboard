import { useRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/shared/utils/cn';
import type { Patient } from '@/patients-dashboard/types';
import PatientCard from '../PatientCard';
import SkeletonCard from '@/patients-dashboard/atoms/SkeletonCard';
import { STAGGER_STEP, useReducedMotionTransition } from '@/shared/motion/motion-presets';

interface PatientCardsGridProps {
  patients: Patient[];
  isLoading?: boolean;
  skeletonCount?: number;
}

// Contenedor: dispara stagger en cadena
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: STAGGER_STEP,
    },
  },
};

// Cada card: fade-in + slide-up
const childVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (custom: { duration: number }) => ({
    opacity: 1,
    y: 0,
    transition: { duration: custom.duration },
  }),
};

function PatientCardsGrid({ patients, isLoading = false, skeletonCount = 6 }: PatientCardsGridProps) {
  const reducedTransition = useReducedMotionTransition();
  const hasMountedRef = useRef(false);

  // After first render, disable stagger — only layout animations apply
  const initialVariant = hasMountedRef.current ? false : 'hidden';
  const animateVariant = 'show';

  // Mark as mounted after first render
  if (!hasMountedRef.current && patients.length > 0) {
    hasMountedRef.current = true;
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          'grid gap-4',
          'grid-cols-1',
          'md:grid-cols-2',
          'lg:grid-cols-3',
        )}
      >
        {Array.from({ length: skeletonCount }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        'grid gap-4',
        'grid-cols-1',
        'md:grid-cols-2',
        'lg:grid-cols-3',
      )}
      variants={containerVariants}
      initial={initialVariant}
      animate={animateVariant}
    >
      {patients.map((patient) => (
        <motion.div
          key={patient.id}
          variants={childVariants}
          custom={{ duration: reducedTransition.duration }}
        >
          <PatientCard patient={patient} />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default PatientCardsGrid;
