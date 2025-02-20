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

const Footer = () => {
  return (
    <div className="text-right text-sm text-gray-400 mb-4">
      <p>
        Built with <br />
        <a
          href="https://ai.google.dev/gemini-api/docs/multimodal-live"
          className="hover:text-gray-300 transition-colors"
        >
          Multimodal Live API
        </a>
      </p>
    </div>
  );
};

export default Footer;
