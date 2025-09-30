import { describe, it, expect } from 'vitest';
import { ConstraintPhysics } from '../core/physics/constraints/calculations.js';

// Minimal mock Rapier JointData and world
function makeMockRapier() {
  return {
    JointData: {
      rope: (...args) => ({ type: 'rope', args }),
      spherical: (...args) => ({ type: 'spherical', args }),
      spring: (...args) => ({ type: 'spring', args }),
      revolute: (...args) => ({ type: 'revolute', args }),
      prismatic: (...args) => ({ type: 'prismatic', args }),
      fixed: (...args) => ({ type: 'fixed', args }),
    }
  };
}

function makeMockWorld() {
  const created = [];
  return {
    created,
    createImpulseJoint: (params, a, b, flag) => {
      const j = { id: created.length + 1, params, a: a?.userData || null, b: b?.userData || null };
      created.push(j);
      return j;
    },
    removeJoint: (j) => {
      const idx = created.indexOf(j);
      if (idx >= 0) created.splice(idx, 1);
    }
  };
}

describe('ConstraintPhysics basic behavior', () => {
  it('creates constraints from object.constraints and scene.joints and reports count', async () => {
    const scene = {
      objects: [
        { id: 'a', type: 'Box', position: [0,0,0], constraints: [ { type: 'distance', targetId: 'b', distance: 2 } ] },
        { id: 'b', type: 'Box', position: [1,0,0] }
      ],
      joints: [ { bodyA: 'a', bodyB: 'b', type: 'rope', params: [[0,0,0],[0,0,0], 3] } ],
      constraints: { enabled: true }
    };


    const cp = new ConstraintPhysics(scene);
    const world = makeMockWorld();
    // Provide forEachRigidBody to mimic Rapier world body iteration
    world.forEachRigidBody = (cb) => {
      scene.objects.forEach((o, i) => cb({ userData: o.id }, i));
    };
    const rapier = makeMockRapier();
    cp.setWorld(world, rapier);

    // wait for initialization delay
    await new Promise(r => setTimeout(r, 70));

    // After initialization, we should have created at least one constraint and one joint
    expect(cp.getConstraintCount()).toBeGreaterThanOrEqual(1);

    // Validate duplicate detection: creating again should not increase count
    const countBefore = cp.getConstraintCount();
    // Call initializeConstraints again (simulate re-init)
    cp.initializeConstraints();
    expect(cp.getConstraintCount()).toBe(countBefore);

    cp.destroy();
    expect(cp.getConstraintCount()).toBe(0);
  });

  it('prevents duplicate joints between same bodies', async () => {
    const scene = {
      objects: [
        { id: 'x', type: 'Box', position: [0,0,0], constraints: [ { type: 'distance', targetId: 'y', distance: 1 } ] },
        { id: 'y', type: 'Box', position: [1,0,0] }
      ],
      joints: [ { bodyA: 'x', bodyB: 'y', type: 'distance', params: [[0,0,0],[0,0,0], 1] } ],
      constraints: { enabled: true }
    };

    const cp = new ConstraintPhysics(scene);
    const world = makeMockWorld();
    world.forEachRigidBody = (cb) => {
      scene.objects.forEach((o, i) => cb({ userData: o.id }, i));
    };
    const rapier = makeMockRapier();
    cp.setWorld(world, rapier);

    await new Promise(r => setTimeout(r, 70));

    // Should have only one created joint despite being specified twice
    expect(cp.getConstraintCount()).toBe(1);

    cp.destroy();
  });
});
