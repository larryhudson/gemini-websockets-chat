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

import { useRef } from "react";
import "./App.scss";
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import SidePanel from "./components/side-panel/SidePanel";
import ControlTray from "./components/control-tray/ControlTray";
import ExplainerPicker from "./components/explainer-picker/ExplainerPicker";
import Footer from "./components/footer/Footer";
import { noteTools } from "./lib/note-tools";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set VITE_GEMINI_API_KEY in .env");
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="App">
      <LiveAPIProvider 
        url={uri} 
        apiKey={API_KEY} 
        config={{
          model: "models/gemini-2.0-flash-exp",
          tools: [noteTools.saveNote, noteTools.getNotes]
        }}
      >
        <div className="streaming-console">
          <SidePanel />
          <main>
            <div className="main-app-area">
              <ExplainerPicker />
              <Footer />
            </div>
            <ControlTray videoRef={videoRef} supportsVideo={false}>
              {/* put your own buttons here */}
            </ControlTray>
          </main>
        </div>
      </LiveAPIProvider>
    </div>
  );
}

export default App;
