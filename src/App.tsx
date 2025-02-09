/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useRef } from 'react';
import './index.css';
import { LiveAPIProvider } from './contexts/LiveAPIContext';
import SidePanel from './components/side-panel/SidePanel';
import ControlTray from './components/control-tray/ControlTray';
import Footer from './components/footer/Footer';
import { Notes } from './components/notes/Notes';

// Always connect through our proxy server
const uri = `ws://${window.location.host}/ws`;

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="font-space-mono">
      <LiveAPIProvider url={uri}>
        <div className="flex h-screen bg-neutral-5 text-gray-300">
          <SidePanel />
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <Notes />
            </div>
            <div className="flex flex-col justify-end min-h-[8rem]">
              <Footer />
              <video ref={videoRef} className="hidden" autoPlay playsInline />
              <ControlTray videoRef={videoRef} supportsVideo={true}>
                {/* put your own buttons here */}
              </ControlTray>
            </div>
          </div>
        </div>
      </LiveAPIProvider>
    </div>
  );
}

export default App;
