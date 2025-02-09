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
import Select from 'react-select';
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
  const [selectedOption, setSelectedOption] = useState<{
    value: string;
    label: string;
  } | null>(null);
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
    <div className={cn('flex flex-col h-screen bg-neutral-5 border-l border-gray-600 transition-all duration-300', {
        'w-96': open,
        'w-16': !open
      })}>
      <header className="flex items-center justify-between p-4 border-b border-gray-600">
        <h2 className="text-gray-200 font-bold">{open ? 'Console' : ''}</h2>
        {open ? (
          <button 
            className="p-2 rounded hover:bg-neutral-15 transition-colors" 
            onClick={() => setOpen(false)}
          >
            <RiSidebarFoldLine className="text-gray-200" />
          </button>
        ) : (
          <button 
            className="p-2 rounded hover:bg-neutral-15 transition-colors" 
            onClick={() => setOpen(true)}
          >
            <RiSidebarUnfoldLine className="text-gray-200" />
          </button>
        )}
      </header>
      <section className="flex items-center gap-2 p-4 border-b border-gray-600">
        <Select
          className="flex-1"
          classNamePrefix="react-select"
          styles={{
            control: (baseStyles) => ({
              ...baseStyles,
              background: 'var(--color-neutral-15)',
              color: 'var(--color-neutral-90)',
              minHeight: '33px',
              maxHeight: '33px',
              border: 0,
              borderRadius: '0.375rem',
            }),
            option: (styles, { isFocused, isSelected }) => ({
              ...styles,
              backgroundColor: isFocused
                ? 'var(--color-neutral-30)'
                : isSelected
                  ? 'var(--color-neutral-20)'
                  : undefined,
            }),
          }}
          defaultValue={selectedOption}
          options={filterOptions}
          onChange={(e) => {
            setSelectedOption(e);
          }}
        />
        <div className={cn('px-2 py-1 rounded text-sm', {
          'bg-blue-700 text-blue-400': connected,
          'bg-neutral-30 text-gray-300': !connected
        })}>
          {connected ? `🔵${open ? ' Streaming' : ''}` : `⏸️${open ? ' Paused' : ''}`}
        </div>
      </section>
      <div className="flex-1 overflow-y-auto" ref={loggerRef}>
        <Logger filter={(selectedOption?.value as LoggerFilterType) || 'none'} />
      </div>
      <div className={cn('p-4 border-t border-gray-600', { 'opacity-50 pointer-events-none': !connected })}>
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
            className={cn('absolute bottom-3 right-3 p-2 rounded-full transition-colors material-symbols-outlined filled', {
              'bg-blue-700 text-blue-400 hover:bg-blue-800': textInput.length,
              'bg-neutral-30 text-gray-300': !textInput.length
            })} 
            onClick={handleSubmit}
            disabled={!textInput.length}
          >
            send
          </button>
        </div>
      </div>
    </div>
  );
}
