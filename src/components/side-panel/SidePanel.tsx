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

import cn from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { RiSidebarFoldLine, RiSidebarUnfoldLine } from 'react-icons/ri';

import { useLiveAPIContext } from '../../contexts/LiveAPIContext';
import { useLoggerStore } from '../../lib/store-logger';
import Logger, { LoggerFilterType } from '../logger/Logger';

const filterOptions = [
  { value: 'conversations', label: 'Conversations' },
  { value: 'tools', label: 'Tool Use' },
  { value: 'none', label: 'All' },
];

export default function SidePanel() {
  const { connected, client } = useLiveAPIContext();
  const [open, setOpen] = useState(true);
  const loggerRef = useRef<HTMLDivElement>(null);
  const loggerLastHeightRef = useRef<number>(-1);
  const { log, logs } = useLoggerStore();

  const [textInput, setTextInput] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<LoggerFilterType>('none');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  //scroll the log to the bottom when new logs come in
  useEffect(() => {
    if (loggerRef.current) {
      const el = loggerRef.current;
      const scrollHeight = el.scrollHeight;
      if (scrollHeight !== loggerLastHeightRef.current) {
        el.scrollTop = scrollHeight;
        loggerLastHeightRef.current = scrollHeight;
      }
    }
  }, [logs]);

  // listen for log events and store them
  useEffect(() => {
    client.on('log', log);
    return () => {
      client.off('log', log);
    };
  }, [client, log]);

  const handleSubmit = () => {
    client.send([{ text: textInput }]);

    setTextInput('');
    if (inputRef.current) {
      inputRef.current.innerText = '';
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-neutral-5 border-l border-gray-600 transition-all duration-300',
        {
          'w-96': open,
          'w-16': !open,
        }
      )}
    >
      <header className="flex items-center justify-between p-4 border-b border-gray-600">
        <h2
          className={cn('text-gray-200 font-bold transition-opacity duration-300', {
            'opacity-0 w-0': !open,
            'opacity-100': open,
          })}
        >
          {open ? 'Console' : ''}
        </h2>
        <button
          className="p-2 rounded hover:bg-neutral-15 transition-colors"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <RiSidebarFoldLine className="text-gray-200" />
          ) : (
            <RiSidebarUnfoldLine className="text-gray-200" />
          )}
        </button>
      </header>
      {open && (
        <>
          <section className="flex items-center gap-2 p-4 border-b border-gray-600">
            <select
              className="flex-1 bg-neutral-15 text-neutral-90 h-[33px] rounded-md px-2 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as LoggerFilterType)}
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div
              className={cn('px-2 py-1 rounded text-sm', {
                'bg-blue-700 text-blue-400': connected,
                'bg-neutral-30 text-gray-300': !connected,
              })}
            >
              {connected ? '🔵 Streaming' : '⏸️ Paused'}
            </div>
          </section>
          <div className="flex-1 overflow-y-auto" ref={loggerRef}>
            <Logger filter={selectedFilter} />
          </div>
          <div
            className={cn('p-4 border-t border-gray-600', {
              'opacity-50 pointer-events-none': !connected,
            })}
          >
            <div className="relative bg-neutral-15 rounded-lg">
              <textarea
                className="w-full min-h-[100px] p-3 bg-transparent text-gray-200 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-lg"
                ref={inputRef}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit();
                  }
                }}
                onChange={(e) => setTextInput(e.target.value)}
                value={textInput}
                placeholder="Type something..."
              ></textarea>

              <button
                className={cn(
                  'absolute bottom-3 right-3 p-2 rounded-full transition-colors material-symbols-outlined filled',
                  {
                    'bg-blue-700 text-blue-400 hover:bg-blue-800': textInput.length,
                    'bg-neutral-30 text-gray-300': !textInput.length,
                  }
                )}
                onClick={handleSubmit}
                disabled={!textInput.length}
              >
                send
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
