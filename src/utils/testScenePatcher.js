// Test file for ScenePatcher integration
import ScenePatcher from '../core/scene/patcher.js';

// Test the JSON patch system
export function testScenePatcher() {
  console.log('🧪 Testing ScenePatcher...');

  const patcher = new ScenePatcher();

  // Test scene
  const testScene = {
    id: 'test-scene',
    name: 'Test Scene',
    gravity: [0, -9.81, 0],
    hasGround: true,
    objects: [
      {
        id: 'ground',
        type: 'Box',
        mass: 0,
        position: [0, 0, 0],
        dimensions: [20, 0.1, 20],
        color: '#666666',
        isStatic: true
      }
    ]
  };

  // Test patches
  const testPatches = [
    {
      op: 'add',
      path: '/objects/-',
      value: {
        id: 'redBall',
        type: 'Sphere',
        mass: 1.0,
        position: [0, 5, 0],
        radius: 0.5,
        color: '#ff0000'
      }
    },
    {
      op: 'replace',
      path: '/gravity',
      value: [0, -15, 0]
    },
    // Test adding controllers to a scene that doesn't have them
    {
      op: 'add',
      path: '/controllers/-',
      value: {
        id: 'test-slider',
        label: 'Test Slider',
        type: 'slider',
        min: 0,
        max: 10,
        value: 5
      }
    }
  ];

  console.log('📋 Original scene objects:', testScene.objects.length);
  console.log('🔧 Applying test patches...');

  const result = patcher.applyPatches(testScene, testPatches);

  if (result.success) {
    console.log('✅ Test passed!');
    console.log('📊 Applied patches:', result.appliedPatches);
    console.log('📋 Updated scene objects:', result.scene.objects.length);
    console.log('⚖️ New gravity:', result.scene.gravity);

    // Verify the changes
    const redBall = result.scene.objects.find(obj => obj.id === 'redBall');
    if (redBall) {
      console.log('🎾 Red ball added successfully:', redBall);
    }

    if (JSON.stringify(result.scene.gravity) === JSON.stringify([0, -15, 0])) {
      console.log('🌍 Gravity updated successfully');
    }

    // Verify controllers were added
    if (result.scene.controllers && result.scene.controllers.length === 1) {
      console.log('🎛️ Controllers array created and slider added successfully');
    } else {
      console.error('❌ Controllers test failed');
      return false;
    }

    return true;
  } else {
    console.error('❌ Test failed:', result.error);
    return false;
  }
}

// Test controller property path handling
export function testControllerPropertyPaths() {
  console.log('🎛️ Testing Controller Property Path Handling...');

  // Test the property path parsing logic from ControllerOverlay
  const testPropertyPaths = [
    { path: 'gravity[0]', expected: [0, -9.81, 0] },
    { path: 'position[0]', expected: [1, 2, 3] },
    { path: 'dimensions[1]', expected: [10, 20, 30] }
  ];

  const testScene = {
    gravity: [0, -9.81, 0],
    position: [1, 2, 3],
    dimensions: [10, 20, 30]
  };

  for (const test of testPropertyPaths) {
    const pathParts = test.path.split(/\[|\]/).filter(p => p !== '');
    let current = testScene;
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        console.error(`❌ Path ${test.path} not found`);
        return false;
      }
      current = current[pathParts[i]];
    }
    const value = current[pathParts[pathParts.length - 1]];

    if (JSON.stringify(value) === JSON.stringify(test.expected[pathParts[pathParts.length - 1]])) {
      console.log(`✅ ${test.path} = ${value}`);
    } else {
      console.error(`❌ ${test.path} failed: got ${value}, expected ${test.expected[pathParts[pathParts.length - 1]]}`);
      return false;
    }
  }

  console.log('✅ Controller property path tests passed');
  return true;
}

// Test Gemini response parsing
export function testGeminiResponseParsing() {
  console.log('🤖 Testing Gemini response parsing...');

  // Mock Gemini response with JSON patches
  const mockResponse = `I'll add a red bouncing ball to the scene and make gravity stronger.

\`\`\`json
[
  {"op": "add", "path": "/objects/-", "value": {"id": "redBall", "type": "Sphere", "mass": 1.0, "position": [0, 5, 0], "radius": 0.5, "color": "#ff0000"}},
  {"op": "replace", "path": "/gravity", "value": [0, -15, 0]}
]
\`\`\`

This will create an interesting physics simulation!`;

  // Test extraction
  const jsonBlocks = mockResponse.match(/```json\s*(\[[\s\S]*?\])\s*```/g);
  if (jsonBlocks) {
    console.log('✅ Found JSON blocks in response');
    for (const block of jsonBlocks) {
      try {
        const cleanBlock = block.replace(/```json\s*|\s*```/g, '');
        const patches = JSON.parse(cleanBlock);
        console.log('📋 Extracted patches:', patches.length);
        return true;
      } catch (error) {
        console.error('❌ Failed to parse JSON block:', error);
        return false;
      }
    }
  } else {
    console.error('❌ No JSON blocks found');
    return false;
  }
}

// Test constraint system integration
export function testConstraintSystem() {
  console.log('🔗 Testing Constraint System...');

  // Mock Cannon.js world and bodies for testing
  const mockWorld = {
    addConstraint: jest.fn(),
    removeConstraint: jest.fn(),
    constraints: []
  };

  const mockBodyA = { userData: { id: 'bodyA' } };
  const mockBodyB = { userData: { id: 'bodyB' } };
  const mockApi = { bodyA: mockBodyA, bodyB: mockBodyB };

  // Mock objectApis
  const objectApis = {
    bodyA: mockApi,
    bodyB: mockApi
  };

  // Test scene with constraints
  const testScene = {
    constraints: { enabled: true },
    objects: [
      {
        id: 'bodyA',
        constraints: [
          { type: 'pointToPoint', targetId: 'bodyB', pivotA: [0, 0, 0], pivotB: [1, 0, 0] }
        ]
      }
    ]
  };

  try {
    // Import and test the constraint system
    import('../core/physics/constraints/calculations.js').then(({ ConstraintPhysics }) => {
      const constraintPhysics = new ConstraintPhysics(testScene, mockWorld);
      constraintPhysics.initializeConstraints(testScene.objects, objectApis);

      // Check if constraint was added to world
      expect(mockWorld.addConstraint).toHaveBeenCalled();
      console.log('✅ Constraint system test passed');
      return true;
    });
  } catch (error) {
    console.error('❌ Constraint system test failed:', error);
    return false;
  }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  console.log('🚀 Running ScenePatcher tests...');
  const patcherTest = testScenePatcher();
  const controllerTest = testControllerPropertyPaths();
  const parsingTest = testGeminiResponseParsing();
  const constraintTest = testConstraintSystem();

  if (patcherTest && controllerTest && parsingTest && constraintTest) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('💥 Some tests failed!');
  }
}
