import React from 'react';
import MediaPreview from './MediaPreview';

/**
 * MediaPreviewDemo - Demonstrates all media preview types
 * This component shows examples of how to use MediaPreview for different content types
 */
export const MediaPreviewDemo: React.FC = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Media Preview Component Demo</h1>
      <p>Examples of different media types that can be embedded in chat messages</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '30px' }}>
        
        {/* Simulation Preview */}
        <section>
          <h2>1. Simulation Preview</h2>
          <p>Physics simulation with link to full visualizer</p>
          <MediaPreview
            type="simulation"
            sceneId="pendulum_energy_v1.0"
            chatId="demo-chat-1"
            title="Pendulum Energy Conservation"
            description="Interactive physics simulation"
            thumbnail="/scenes/pendulum_energy/thumbnail.png"
            metadata={{
              objectCount: 5,
              duration: 10
            }}
          />
        </section>

        {/* Image Preview */}
        <section>
          <h2>2. Image Preview</h2>
          <p>Static image with full view option</p>
          <MediaPreview
            type="image"
            src="https://picsum.photos/800/600"
            title="Physics Diagram"
            description="Force vectors illustration"
            metadata={{
              dimensions: { width: 800, height: 600 },
              fileSize: '125 KB'
            }}
          />
        </section>

        {/* Video Preview */}
        <section>
          <h2>3. Video Preview</h2>
          <p>Video with play/pause/reset controls</p>
          <MediaPreview
            type="video"
            src="https://www.w3schools.com/html/mov_bbb.mp4"
            title="Educational Video"
            description="Physics concepts explained"
            thumbnail="https://picsum.photos/400/225"
            metadata={{
              duration: 10,
              fileSize: '1.5 MB'
            }}
          />
        </section>

        {/* SVG Preview */}
        <section>
          <h2>4. SVG Preview</h2>
          <p>Scalable vector graphics</p>
          <MediaPreview
            type="svg"
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='80' fill='%234F46E5'/%3E%3Ctext x='100' y='110' text-anchor='middle' fill='white' font-size='24' font-family='Arial'%3ESVG%3C/text%3E%3C/svg%3E"
            title="Vector Diagram"
            description="Scalable illustration"
          />
        </section>

        {/* PDF Preview */}
        <section>
          <h2>5. PDF Preview (Placeholder)</h2>
          <p>Embedded PDF document viewer</p>
          <MediaPreview
            type="pdf"
            src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            title="Research Paper"
            description="Academic document"
            metadata={{
              fileSize: '125 KB'
            }}
          />
        </section>

        {/* Animation/IFrame Preview */}
        <section>
          <h2>6. Animation Preview</h2>
          <p>Embedded animation or interactive content</p>
          <MediaPreview
            type="animation"
            src="data:text/html,%3C!DOCTYPE html%3E%3Chtml%3E%3Chead%3E%3Cstyle%3Ebody%7Bmargin:0;padding:0;background:%23000;display:flex;justify-content:center;align-items:center;height:100vh%7D.circle%7Bwidth:100px;height:100px;border-radius:50%25;background:%234F46E5;animation:pulse 2s infinite%7D@keyframes pulse%7B0%25,100%25%7Btransform:scale(1);opacity:1%7D50%25%7Btransform:scale(1.5);opacity:0.5%7D%7D%3C/style%3E%3C/head%3E%3Cbody%3E%3Cdiv class='circle'%3E%3C/div%3E%3C/body%3E%3C/html%3E"
            title="Pulsing Animation"
            description="CSS animation demo"
            autoPlay={true}
          />
        </section>

        {/* Multiple Media Examples */}
        <section>
          <h2>7. Multiple Media in Sequence</h2>
          <p>Example of multiple media items in chat messages</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <MediaPreview
              type="simulation"
              sceneId="binary_star_v1.0"
              chatId="demo-chat-2"
              title="Binary Star System"
              description="Gravitational interaction"
              thumbnail="/scenes/binary_star/thumbnail.png"
              metadata={{
                objectCount: 2
              }}
            />
            <MediaPreview
              type="image"
              src="https://picsum.photos/400/300"
              title="Graph Output"
              description="Velocity vs Time"
            />
          </div>
        </section>

        {/* Usage Notes */}
        <section style={{ 
          background: 'var(--card-bg)', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <h2>Usage Notes</h2>
          <ul style={{ lineHeight: '1.8' }}>
            <li><strong>Simulations:</strong> Automatically link to the full visualizer</li>
            <li><strong>Videos:</strong> Include native play/pause/reset controls</li>
            <li><strong>Images:</strong> Click to open in new tab at full resolution</li>
            <li><strong>PDFs:</strong> Embedded viewer with option to open externally</li>
            <li><strong>SVGs:</strong> Scalable and interactive</li>
            <li><strong>Animations:</strong> Auto-play supported for background animations</li>
          </ul>
          
          <h3 style={{ marginTop: '20px' }}>Adding Media to Messages</h3>
          <pre style={{
            background: 'var(--bg-darker)',
            padding: '15px',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '13px'
          }}>
{`const message = {
  id: 1,
  text: "Here's a simulation!",
  isUser: false,
  mediaContent: {
    type: 'simulation',
    sceneId: 'my_scene_v1.0',
    title: 'My Scene',
    thumbnail: '/path/to/thumb.png'
  }
};`}
          </pre>
        </section>
      </div>
    </div>
  );
};

export default MediaPreviewDemo;
