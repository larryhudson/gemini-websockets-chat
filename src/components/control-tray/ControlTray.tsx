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

import { memo, ReactNode, RefObject, useEffect, useRef, useState } from 'react';
import { useLiveAPIContext } from '../../contexts/LiveAPIContext';
import { UseMediaStreamResult } from '../../hooks/use-media-stream-mux';
import { useScreenCapture } from '../../hooks/use-screen-capture';
import { useWebcam } from '../../hooks/use-webcam';
import { AudioRecorder } from '../../lib/audio-recorder';
import AudioPulse from '../audio-pulse/AudioPulse';

export type ControlTrayProps = {
  videoRef: RefObject<HTMLVideoElement>;
  children?: ReactNode;
  supportsVideo: boolean;
  onVideoStreamChange?: (stream: MediaStream | null) => void;
};

type MediaStreamButtonProps = {
  isStreaming: boolean;
  onIcon: string;
  offIcon: string;
  start: () => Promise<any>;
  stop: () => any;
};

/**
 * button used for triggering webcam or screen-capture
 */
const MediaStreamButton = memo(
  ({ isStreaming, onIcon, offIcon, start, stop }: MediaStreamButtonProps) =>
    isStreaming ? (
      <button
        className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-15 hover:bg-neutral-20 text-gray-300 transition-colors"
        onClick={stop}
      >
        <span className="material-symbols-outlined">{onIcon}</span>
      </button>
    ) : (
      <button
        className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-15 hover:bg-neutral-20 text-gray-300 transition-colors"
        onClick={start}
      >
        <span className="material-symbols-outlined">{offIcon}</span>
      </button>
    )
);

function ControlTray({
  videoRef,
  children,
  onVideoStreamChange = () => {},
  supportsVideo,
}: ControlTrayProps) {
  const videoStreams = [useWebcam(), useScreenCapture()];
  const [activeVideoStream, setActiveVideoStream] = useState<MediaStream | null>(null);
  const [webcam, screenCapture] = videoStreams;
  const [inVolume, setInVolume] = useState(0);
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);
  const renderCanvasRef = useRef<HTMLCanvasElement>(null);
  const connectButtonRef = useRef<HTMLButtonElement>(null);

  const { client, connected, connect, disconnect, volume } = useLiveAPIContext();

  useEffect(() => {
    if (!connected && connectButtonRef.current) {
      connectButtonRef.current.focus();
    }
  }, [connected]);
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--volume',
      `${Math.max(5, Math.min(inVolume * 200, 8))}px`
    );
  }, [inVolume]);

  useEffect(() => {
    const onData = (base64: string) => {
      client.sendRealtimeInput([
        {
          mimeType: 'audio/pcm;rate=16000',
          data: base64,
        },
      ]);
    };
    if (connected && !muted && audioRecorder) {
      audioRecorder.on('data', onData).on('volume', setInVolume).start();
    } else {
      audioRecorder.stop();
    }
    return () => {
      audioRecorder.off('data', onData).off('volume', setInVolume);
    };
  }, [connected, client, muted, audioRecorder]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = activeVideoStream;
    }

    let timeoutId = -1;

    function sendVideoFrame() {
      const video = videoRef.current;
      const canvas = renderCanvasRef.current;

      if (!video || !canvas) {
        return;
      }

      const ctx = canvas.getContext('2d')!;
      canvas.width = video.videoWidth * 0.25;
      canvas.height = video.videoHeight * 0.25;
      if (canvas.width + canvas.height > 0) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 1.0);
        const data = base64.slice(base64.indexOf(',') + 1, Infinity);
        client.sendRealtimeInput([{ mimeType: 'image/jpeg', data }]);
      }
      if (connected) {
        timeoutId = window.setTimeout(sendVideoFrame, 1000 / 0.5);
      }
    }
    if (connected && activeVideoStream !== null) {
      requestAnimationFrame(sendVideoFrame);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [connected, activeVideoStream, client, videoRef]);

  //handler for swapping from one video-stream to the next
  const changeStreams = (next?: UseMediaStreamResult) => async () => {
    if (next) {
      const mediaStream = await next.start();
      setActiveVideoStream(mediaStream);
      onVideoStreamChange(mediaStream);
    } else {
      setActiveVideoStream(null);
      onVideoStreamChange(null);
    }

    videoStreams.filter((msr) => msr !== next).forEach((msr) => msr.stop());
  };

  return (
    <section className="border-t border-gray-600 bg-neutral-5">
      <canvas className="hidden" ref={renderCanvasRef} />
      <div className="flex items-center justify-between p-4 h-[72px]">
        <nav
          className={cn('flex items-center gap-4', {
            'opacity-50 pointer-events-none': !connected,
          })}
        >
          <button
            className={cn('w-10 h-10 shrink-0 inline-flex items-center justify-center rounded-full transition-colors', {
              'bg-blue-700 text-blue-400 hover:bg-blue-800': !muted,
              'bg-neutral-15 text-gray-300 hover:bg-neutral-20': muted,
            })}
            onClick={() => setMuted(!muted)}
          >
            <span className="material-symbols-outlined filled">{!muted ? 'mic' : 'mic_off'}</span>
          </button>

          <div className="w-10 h-10 shrink-0 inline-flex items-center justify-center rounded-full bg-neutral-15 text-gray-300">
            <AudioPulse volume={volume} active={connected} hover={false} />
          </div>

          {supportsVideo && (
            <>
              <MediaStreamButton
                isStreaming={screenCapture.isStreaming}
                start={changeStreams(screenCapture)}
                stop={changeStreams()}
                onIcon="cancel_presentation"
                offIcon="present_to_all"
              />
              <MediaStreamButton
                isStreaming={webcam.isStreaming}
                start={changeStreams(webcam)}
                stop={changeStreams()}
                onIcon="videocam_off"
                offIcon="videocam"
              />
            </>
          )}
          {children}
        </nav>

        <div className="flex items-center gap-4">
          <button
            ref={connectButtonRef}
            className={cn('w-10 h-10 shrink-0 inline-flex items-center justify-center rounded-full transition-colors', {
              'bg-blue-700 text-blue-400 hover:bg-blue-800': connected,
              'bg-neutral-15 text-gray-300 hover:bg-neutral-20': !connected,
            })}
            onClick={connected ? disconnect : connect}
          >
            <span className="material-symbols-outlined filled">
              {connected ? 'pause' : 'play_arrow'}
            </span>
          </button>
          {connected && <span className="text-gray-300">Streaming</span>}
        </div>
      </div>
    </section>
  );
}

export default memo(ControlTray);
