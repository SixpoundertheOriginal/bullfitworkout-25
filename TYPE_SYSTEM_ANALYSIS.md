# Type System Analysis - Workout App

## Current State (STEP 2: Analysis)

### ExerciseSet Type Conflicts Identified

#### 1. Store Types (`/src/store/workout/types.ts`)
```typescript
export interface ExerciseSet {
  id: string;
  exercise_name: string;
  weight: number;
  reps: number;
  restTime: number;
  completed: boolean;
  set_number: number;
  isEditing?: boolean;  // OPTIONAL
  rpe?: number;
  workout_id?: string;
}
```

#### 2. Component Types (`/src/types/exercise.ts`)
```typescript
export interface ExerciseSet {
  id: string;
  workout_id: string; // REQUIRED
  exercise_name: string;
  weight: number;
  reps: number;
  set_number: number; // REQUIRED
  completed: boolean;
  isEditing: boolean; // REQUIRED
  restTime: number;
  rpe?: number;
  // ... other optional fields
}
```

#### 3. Legacy Types (potentially in other files)
- Different required/optional field combinations
- Inconsistent naming conventions

## Root Problems

### 1. Type Fragmentation
- **Store type** has `isEditing?: boolean` (optional)
- **Component type** has `isEditing: boolean` (required)
- **workout_id** field requirements differ

### 2. Adapter Pattern Complexity
- `adaptExerciseSets()` tries to bridge incompatible types
- Creates runtime overhead and type casting
- Masks fundamental architectural issues

### 3. Import Confusion
- Same interface name in multiple files
- TypeScript picks different definitions based on import path
- Leads to "assignability" errors

## Recommended Architecture (STEP 3: Plan)

### 1. Single Source of Truth
- **Canonical type**: Use store type as the base truth
- **Location**: `/src/store/workout/types.ts`
- **Strategy**: Make all optional fields explicit

### 2. Type Unification Strategy
```typescript
// New unified ExerciseSet
export interface ExerciseSet {
  id: string;
  workout_id: string;           // Always required
  exercise_name: string;
  weight: number;
  reps: number;
  set_number: number;          // Always required
  completed: boolean;
  isEditing: boolean;          // Always required, default false
  restTime: number;            // Always required, default 60
  rpe?: number;                // Always optional
}
```

### 3. Migration Strategy
1. Update store type definition
2. Update all store actions to handle required fields
3. Remove adapter functions
4. Update components to use store types directly
5. Clean up duplicate type definitions

## Implementation Steps (STEP 4)

### Phase 1: Store Foundation
- [ ] Update `/src/store/workout/types.ts`
- [ ] Update store actions and reducers
- [ ] Ensure default values for required fields

### Phase 2: Component Updates
- [ ] Remove adapter functions
- [ ] Update component imports
- [ ] Fix component implementations

### Phase 3: Cleanup
- [ ] Remove duplicate type definitions
- [ ] Update utility functions
- [ ] Test all workflows

## Current Status
- ✅ STEP 1: Reverted to working state (infinite loop fixed)
- ✅ STEP 2: Type conflicts mapped and documented
- 🔄 STEP 3: Architecture plan created
- ⏳ STEP 4: Ready for systematic implementation

## Next Action
Proceed with Phase 1: Update the canonical store type definition and ensure all required fields have proper defaults.
