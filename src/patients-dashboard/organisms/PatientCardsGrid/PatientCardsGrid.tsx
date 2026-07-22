import { motion } from 'motion/react';
import { cn } from '@/shared/utils/cn';
import type { Patient } from '@/patients-dashboard/types';
import PatientCard from '../PatientCard';
import SkeletonCard from '@/patients-dashboard/atoms/SkeletonCard';
import { STAGGER_STEP, useReducedMotionTransition } from '@/shared/motion/motion-presets';

interface PatientCardsGridProps {
  patients: Patient[];
  isLoading?: boolean;
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

function PatientCardsGrid({ patients, isLoading = false }: PatientCardsGridProps) {
  const reducedTransition = useReducedMotionTransition();

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
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
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
      initial="hidden"
      animate="show"
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
