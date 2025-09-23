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

    return true;
  } else {
    console.error('❌ Test failed:', result.error);
    return false;
  }
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

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  console.log('🚀 Running ScenePatcher tests...');
  const patcherTest = testScenePatcher();
  const parsingTest = testGeminiResponseParsing();

  if (patcherTest && parsingTest) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('💥 Some tests failed!');
  }
}
