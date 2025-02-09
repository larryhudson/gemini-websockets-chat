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



import { Part } from '@google/generative-ai';
import cn from 'classnames';
import { ReactNode } from 'react';
import { useLoggerStore } from '../../lib/store-logger';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 as dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {
  ClientContentMessage,
  isClientContentMessage,
  isInterrupted,
  isModelTurn,
  isServerContentMessage,
  isToolCallCancellationMessage,
  isToolCallMessage,
  isToolResponseMessage,
  isTurnComplete,
  ModelTurn,
  ServerContentMessage,
  StreamingLog,
  ToolCallCancellationMessage,
  ToolCallMessage,
  ToolResponseMessage,
} from '../../multimodal-live-types';

const formatTime = (d: Date) => d.toLocaleTimeString().slice(0, -3);

const LogEntry = ({
  log,
  MessageComponent,
}: {
  log: StreamingLog;
  MessageComponent: ({ message }: { message: StreamingLog['message'] }) => ReactNode;
}): JSX.Element => (
  <li
    className={cn('flex flex-col py-2 font-mono text-sm', {
      'text-[var(--color-blue-500)]': log.type.includes('receive') || log.type.slice(0, log.type.indexOf('.')) === 'server',
      'text-[var(--color-green-500)]': log.type.includes('send') || (log.type.slice(0, log.type.indexOf('.')) === 'client' && !log.type.includes('server')),
      'text-[var(--color-neutral-50)]': !log.type.includes('receive') && !log.type.includes('send') && !['server', 'client'].includes(log.type.slice(0, log.type.indexOf('.')))
    })}
  >
    <div className="flex gap-2 mb-1">
      <span className="flex-shrink-0">{formatTime(log.date)}</span>
      <span className="flex-shrink-0 font-bold">{log.type}</span>
      {log.count && <span className="count">{log.count}</span>}
    </div>
    <div className="message pl-4">
      <MessageComponent message={log.message} />
    </div>
  </li>
);

const PlainTextMessage = ({ message }: { message: StreamingLog['message'] }) => (
  <span className="break-words">{message as string}</span>
);

type Message = { message: StreamingLog['message'] };

const AnyMessage = ({ message }: Message) => <pre className="whitespace-pre-wrap break-words">{JSON.stringify(message, null, '  ')}</pre>;

function tryParseCodeExecutionResult(output: string) {
  try {
    const json = JSON.parse(output);
    return JSON.stringify(json, null, '  ');
  } catch (e) {
    return output;
  }
}

const RenderPart = ({ part }: { part: Part }) =>
  part.text && part.text.length ? (
    <p className="bg-neutral-5 p-3.5 mb-1 text-neutral-90 rounded-lg">{part.text}</p>
  ) : part.executableCode ? (
    <div className="bg-neutral-5 p-3.5 mb-1 text-neutral-90 rounded-lg">
      <h5 className="m-0 pb-2 border-b border-neutral-20">executableCode: {part.executableCode.language}</h5>
      <SyntaxHighlighter language={part.executableCode.language.toLowerCase()} style={dark}>
        {part.executableCode.code}
      </SyntaxHighlighter>
    </div>
  ) : part.codeExecutionResult ? (
    <div className="bg-neutral-5 p-3.5 mb-1 text-neutral-90 rounded-lg">
      <h5 className="m-0 pb-2 border-b border-neutral-20">codeExecutionResult: {part.codeExecutionResult.outcome}</h5>
      <SyntaxHighlighter language="json" style={dark}>
        {tryParseCodeExecutionResult(part.codeExecutionResult.output)}
      </SyntaxHighlighter>
    </div>
  ) : (
    <div className="bg-neutral-5 p-3.5 mb-1 text-neutral-90 rounded-lg">
      <h5 className="m-0 pb-2 border-b border-neutral-20">Inline Data: {part.inlineData?.mimeType}</h5>
    </div>
  );

const ClientContentLog = ({ message }: Message) => {
  const { turns, turnComplete } = (message as ClientContentMessage).clientContent;
  return (
    <div className="flex flex-col gap-1">
      <h4 className="text-sm uppercase py-2 m-0 text-[var(--color-green-500)]">User</h4>
      {turns.map((turn, i) => (
        <div key={`message-turn-${i}`}>
          {turn.parts
            .filter((part) => !(part.text && part.text === '\n'))
            .map((part, j) => (
              <RenderPart part={part} key={`message-turh-${i}-part-${j}`} />
            ))}
        </div>
      ))}
      {!turnComplete ? <span>turnComplete: false</span> : ''}
    </div>
  );
};

const ToolCallLog = ({ message }: Message) => {
  const { toolCall } = message as ToolCallMessage;
  return (
    <div className="flex flex-col gap-1">
      <h4 className="text-sm uppercase py-2 m-0">Tool Call</h4>
      {toolCall.functionCalls.map((fc) => (
        <div key={fc.id} className="bg-neutral-5 p-3.5 mb-1 text-neutral-90 rounded-lg">
          <h5>Function call: {fc.name}</h5>
          <SyntaxHighlighter language="json" style={dark}>
            {JSON.stringify(fc, null, '  ')}
          </SyntaxHighlighter>
        </div>
      ))}
    </div>
  );
};

const ToolCallCancellationLog = ({ message }: Message): JSX.Element => (
  <div className="flex flex-col gap-1">
    <h4 className="text-sm uppercase py-2 m-0">Tool Call Cancelled</h4>
    <span className="bg-neutral-5 p-3.5 mb-1 text-neutral-90 rounded-lg">
      {' '}
      ids:{' '}
      {(message as ToolCallCancellationMessage).toolCallCancellation.ids.map((id) => (
        <span className="italic last:after:content-none after:content-[',_']" key={`cancel-${id}`}>
          &quot;{id}&quot;
        </span>
      ))}
    </span>
  </div>
);

const ToolResponseLog = ({ message }: Message): JSX.Element => (
  <div className="flex flex-col gap-1">
    <h4 className="text-sm uppercase py-2 m-0">Tool Response</h4>
    {(message as ToolResponseMessage).toolResponse.functionResponses.map((fc) => (
      <div key={`tool-response-${fc.id}`} className="bg-neutral-5 p-3.5 mb-1 text-neutral-90 rounded-lg">
        <h5>Function Response: {fc.id}</h5>
        <SyntaxHighlighter language="json" style={dark}>
          {JSON.stringify(fc.response, null, '  ')}
        </SyntaxHighlighter>
      </div>
    ))}
  </div>
);

const ModelTurnLog = ({ message }: Message): JSX.Element => {
  const serverContent = (message as ServerContentMessage).serverContent;
  const { modelTurn } = serverContent as ModelTurn;
  const { parts } = modelTurn;

  return (
    <div className="flex flex-col gap-1">
      <h4 className="text-sm uppercase py-2 m-0 text-[var(--color-blue-500)]">Model {isInterrupted(message) ? '(interrupted)' : isTurnComplete(message) ? '(complete)' : '(incomplete)'}</h4>
      {parts
        .filter((part) => !(part.text && part.text === '\n'))
        .map((part, j) => (
          <RenderPart part={part} key={`model-turn-part-${j}`} />
        ))}
    </div>
  );
};

const CustomPlainTextLog = (msg: string) => () => <PlainTextMessage message={msg} />;

export type LoggerFilterType = 'conversations' | 'tools' | 'none';

export type LoggerProps = {
  filter: LoggerFilterType;
};

const filters: Record<LoggerFilterType, (log: StreamingLog) => boolean> = {
  tools: (log: StreamingLog) =>
    isToolCallMessage(log.message) ||
    isToolResponseMessage(log.message) ||
    isToolCallCancellationMessage(log.message),
  conversations: (log: StreamingLog) =>
    isClientContentMessage(log.message) || isServerContentMessage(log.message),
  none: () => true,
};

const component = (log: StreamingLog) => {
  if (typeof log.message === 'string') {
    return PlainTextMessage;
  }
  if (isClientContentMessage(log.message)) {
    return ClientContentLog;
  }
  if (isToolCallMessage(log.message)) {
    return ToolCallLog;
  }
  if (isToolCallCancellationMessage(log.message)) {
    return ToolCallCancellationLog;
  }
  if (isToolResponseMessage(log.message)) {
    return ToolResponseLog;
  }
  if (isServerContentMessage(log.message)) {
    const { serverContent } = log.message;
    if (isInterrupted(serverContent)) {
      return CustomPlainTextLog('interrupted');
    }
    if (isTurnComplete(serverContent)) {
      return CustomPlainTextLog('turnComplete');
    }
    if (isModelTurn(serverContent)) {
      return ModelTurnLog;
    }
  }
  return AnyMessage;
};

export default function Logger({ filter = 'none' }: LoggerProps) {
  const { logs } = useLoggerStore();

  const filterFn = filters[filter];

  return (
    <div className="text-gray-300 w-full max-w-full block">
      <ul className="pl-2 pr-2 overflow-x-hidden w-full">
        {logs.filter(filterFn).map((log, key) => {
          return <LogEntry MessageComponent={component(log)} log={log} key={key} />;
        })}
      </ul>
    </div>
  );
}
