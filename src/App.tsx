import React, { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import {
  Bot,
  Check,
  Copy,
  Film,
  Loader2,
  Play,
  RefreshCw,
  Sparkles,
  Users,
  Volume2,
  Wand2,
} from 'lucide-react';
import {
  AppState,
  AudienceType,
  ContentStyle,
  GeneratedResult,
  SceneCount,
  VideoModelType,
  VoiceType,
} from './types';
import { generateContent } from './services/ai';
import { getHistory, saveResult } from './services/storage';

const STYLE_OPTIONS: ContentStyle[] = [
  'Vui vẻ',
  'Giáo dục',
  'Truyền cảm hứng',
  'Hài hước',
  'Gần gũi',
  'Kể chuyện',
  'Chuyên nghiệp',
  'Dễ hiểu',
];

const AUDIENCE_OPTIONS: AudienceType[] = [
  'Trẻ em',
  'Người trưởng thành',
  'Gia đình',
  'Người quan tâm sức khỏe',
  'Tùy chỉnh',
];

const INITIAL_STATE: AppState = {
  topic: '',
  sceneCount: 3,
  style: 'Giáo dục',
  audience: 'Gia đình',
  customAudience: '',
  voice: 'Bắc',
  aspectRatio: '9:16',
  requirements: '',
  videoModel: 'Veo 3',
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function Button({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function FieldTitle({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-blue text-xs font-black text-white">
          {number}
        </span>
        <h2 className="font-bold text-brand-text-title">{title}</h2>
      </div>
      {description && <p className="mt-1 pl-9 text-xs text-brand-text-muted">{description}</p>}
    </div>
  );
}

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [history, setHistory] = useState<GeneratedResult[]>([]);
  const [currentResult, setCurrentResult] = useState<GeneratedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  useEffect(() => {
    void (async () => {
      const hist = await getHistory();
      setHistory(hist);
      if (hist[0]) setCurrentResult(hist[0]);
    })();
  }, []);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success('Đã sao chép');
      window.setTimeout(() => setCopiedKey(''), 1500);
    } catch {
      toast.error('Không thể sao chép. Vui lòng thử lại.');
    }
  };

  const handleGenerate = async () => {
    if (!state.topic.trim()) {
      toast.error('Vui lòng nhập chủ đề video');
      return;
    }
    if (state.audience === 'Tùy chỉnh' && !state.customAudience.trim()) {
      toast.error('Vui lòng nhập đối tượng xem tùy chỉnh');
      return;
    }

    setLoading(true);
    try {
      const result = await generateContent({ ...state, topic: state.topic.trim() });
      await saveResult(result);
      const hist = await getHistory();
      setHistory(hist);
      setCurrentResult(result);
      toast.success('Đã tạo kịch bản hoạt hình 3D');
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Không thể tạo kịch bản. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setState(INITIAL_STATE);
    setCurrentResult(null);
    setCopiedKey('');
  };

  return (
    <div className="min-h-screen bg-brand-bg-sub text-brand-text-body pb-20">
      <Toaster position="top-center" richColors />
      <header className="sticky top-0 z-50 bg-gradient-to-br from-brand-blue to-brand-blue-dark shadow-md">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-yellow-light">
              <Bot className="h-6 w-6 text-brand-text-title" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-black text-white sm:text-lg">
                Tạo Video Hoạt Hình 3D
              </h1>
              <p className="hidden text-xs text-white/75 sm:block">
                Chủ đề bất kỳ → nhân vật 3D → câu chuyện liền mạch
              </p>
            </div>
          </div>
          <Button
            onClick={resetApp}
            className="shrink-0 border border-white/30 bg-white/15 px-3 py-2 text-xs text-white hover:bg-white/25"
          >
            <RefreshCw className="h-4 w-4" />
            Tạo mới
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-7 px-4 py-6 lg:grid-cols-12">
        <section className="space-y-5 lg:col-span-5">
          <div className="card">
            <FieldTitle
              number={1}
              title="Chủ đề video"
              description="AI tự xác định nhân vật hoạt hình 3D phù hợp nhất."
            />
            <textarea
              className="input min-h-[140px]"
              placeholder="Ví dụ: Tác dụng của củ tỏi, lợi ích của quả chanh, hành trình của giọt nước..."
              value={state.topic}
              onChange={(event) =>
                setState((old) => ({ ...old, topic: event.target.value.slice(0, 2000) }))
              }
            />
            <div className="mt-2 text-right text-xs text-brand-text-muted">
              {state.topic.length}/2000 ký tự
            </div>
          </div>

          <div className="card">
            <FieldTitle number={2} title="Số cảnh" description="Mỗi cảnh dài khoảng 8 giây." />
            <div className="grid grid-cols-3 gap-2">
              {([3, 4, 5] as SceneCount[]).map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setState((old) => ({ ...old, sceneCount: count }))}
                  className={cx(
                    'rounded-xl border px-3 py-3 font-black',
                    state.sceneCount === count
                      ? 'border-brand-blue bg-brand-blue text-white'
                      : 'border-brand-border bg-white hover:border-brand-blue',
                  )}
                >
                  {count} cảnh
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <FieldTitle number={3} title="Phong cách nội dung" />
            <div className="grid grid-cols-2 gap-2">
              {STYLE_OPTIONS.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setState((old) => ({ ...old, style }))}
                  className={cx(
                    'min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-bold',
                    state.style === style
                      ? 'border-brand-blue bg-brand-blue text-white'
                      : 'border-brand-border bg-white hover:border-brand-blue',
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <FieldTitle number={4} title="Đối tượng xem" />
            <div className="mb-3 flex items-center gap-2 text-brand-text-muted">
              <Users className="h-4 w-4" />
              <span className="text-xs">Nội dung và cách diễn đạt sẽ được điều chỉnh theo người xem.</span>
            </div>
            <select
              className="input h-12"
              value={state.audience}
              onChange={(event) =>
                setState((old) => ({
                  ...old,
                  audience: event.target.value as AudienceType,
                }))
              }
            >
              {AUDIENCE_OPTIONS.map((audience) => (
                <option key={audience}>{audience}</option>
              ))}
            </select>
            {state.audience === 'Tùy chỉnh' && (
              <input
                className="input mt-3 h-12"
                placeholder="Nhập đối tượng xem mong muốn..."
                value={state.customAudience}
                onChange={(event) =>
                  setState((old) => ({ ...old, customAudience: event.target.value }))
                }
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="card">
              <div className="mb-2 flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-brand-blue" />
                <h3 className="font-bold text-brand-text-title">Giọng đọc</h3>
              </div>
              <select
                className="input h-12"
                value={state.voice}
                onChange={(event) =>
                  setState((old) => ({ ...old, voice: event.target.value as VoiceType }))
                }
              >
                <option>Bắc</option>
                <option>Trung</option>
                <option>Nam</option>
              </select>
            </div>

            <div className="card">
              <div className="mb-2 flex items-center gap-2">
                <Film className="h-4 w-4 text-brand-blue" />
                <h3 className="font-bold text-brand-text-title">Tỉ lệ video</h3>
              </div>
              <select className="input h-12" value={state.aspectRatio} disabled>
                <option>9:16</option>
              </select>
            </div>
          </div>

          <div className="card">
            <FieldTitle
              number={5}
              title="Yêu cầu bổ sung"
              description="Tùy chỉnh bối cảnh, màu sắc, cảm xúc hoặc thông điệp."
            />
            <textarea
              className="input min-h-[100px]"
              placeholder="Ví dụ: Bối cảnh khu vườn, màu sắc tươi sáng, cảm xúc vui vẻ..."
              value={state.requirements}
              onChange={(event) =>
                setState((old) => ({ ...old, requirements: event.target.value }))
              }
            />
          </div>

          <div className="card">
            <h3 className="mb-3 font-bold text-brand-text-title">Model video gốc</h3>
            <div className="grid grid-cols-2 gap-2">
              {(['Veo 3', 'Gork'] as VideoModelType[]).map((model) => (
                <button
                  key={model}
                  type="button"
                  onClick={() => setState((old) => ({ ...old, videoModel: model }))}
                  className={cx(
                    'rounded-xl border p-3 font-bold',
                    state.videoModel === model
                      ? 'border-brand-blue bg-brand-blue text-white'
                      : 'border-brand-border bg-white',
                  )}
                >
                  {model}
                  <span className="block text-xs font-medium">
                    Video {model === 'Veo 3' ? 8 : 10} giây
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="h-14 w-full bg-brand-yellow text-base text-brand-text-title shadow-lg hover:bg-brand-yellow-light"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Wand2 className="h-5 w-5" />
            )}
            {loading ? 'AI đang xây dựng câu chuyện...' : 'Tạo kịch bản hoạt hình 3D'}
          </Button>
        </section>

        <section className="space-y-5 lg:col-span-7">
          {!currentResult ? (
            <div className="grid min-h-[440px] place-items-center rounded-2xl border border-dashed border-brand-border bg-white p-7 text-center">
              <div className="max-w-md">
                <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-brand-blue-light">
                  <Sparkles className="h-10 w-10 text-brand-blue-dark" />
                </div>
                <h2 className="mb-2 text-xl font-black text-brand-text-title">
                  Câu chuyện 3D bắt đầu từ một chủ đề
                </h2>
                <p className="text-sm leading-6 text-brand-text-muted">
                  AI sẽ tạo nhân vật trung tâm, nhận diện cố định, prompt video và lời thoại
                  liền mạch cho từng cảnh.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="card overflow-hidden">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 text-xs font-black uppercase tracking-wider text-brand-blue">
                      Nhân vật trung tâm
                    </div>
                    <h2 className="text-xl font-black text-brand-text-title">
                      {currentResult.character.name}
                    </h2>
                  </div>
                  <div className="rounded-full bg-brand-yellow-light px-3 py-1 text-xs font-bold text-[#92400E]">
                    {currentResult.inputs.sceneCount} cảnh · {currentResult.inputs.aspectRatio}
                  </div>
                </div>
                <p className="mb-4 text-sm leading-6">{currentResult.character.description}</p>
                <div className="rounded-xl border border-brand-border bg-brand-bg-sub p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-black uppercase text-brand-text-title">
                      Nhận diện cố định
                    </span>
                    <Button
                      onClick={() =>
                        copyToClipboard(currentResult.character.fixedIdentity, 'character')
                      }
                      className="h-9 border border-brand-blue bg-white px-3 text-xs text-brand-blue"
                    >
                      {copiedKey === 'character' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      Sao chép
                    </Button>
                  </div>
                  <p className="text-xs leading-5 text-brand-text-muted">
                    {currentResult.character.fixedIdentity}
                  </p>
                </div>
                <div className="mt-4 rounded-xl bg-brand-yellow-light/60 p-3 text-sm font-medium">
                  {currentResult.summary}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Play className="h-5 w-5 text-brand-blue" />
                <h2 className="text-lg font-black text-brand-text-title">
                  Kịch bản chi tiết ({currentResult.scenes.length} cảnh)
                </h2>
              </div>

              {currentResult.scenes.map((scene, index) => {
                const promptKey = 'prompt-' + index;
                const voiceKey = 'voice-' + index;
                return (
                  <article
                    key={index}
                    className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-brand-blue to-brand-blue-dark px-4 py-3 text-white">
                      <div>
                        <span className="text-[11px] font-bold uppercase text-white/70">
                          Cảnh {index + 1}
                        </span>
                        <h3 className="font-black">{scene.title}</h3>
                      </div>
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                        ~8 giây
                      </span>
                    </div>

                    <details className="group border-b border-brand-border bg-brand-bg-sub">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-black text-brand-text-title [&::-webkit-details-marker]:hidden">
                        <span>Chi tiết cảnh: Bối cảnh · Hành động · Biểu cảm · Góc máy</span>
                        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] text-brand-blue group-open:hidden">
                          Xem
                        </span>
                        <span className="hidden shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] text-brand-blue group-open:inline">
                          Thu gọn
                        </span>
                      </summary>
                      <div className="grid grid-cols-2 gap-3 border-t border-brand-border/70 px-4 py-3 text-xs sm:grid-cols-4">
                        <div>
                          <div className="font-black text-brand-text-title">Bối cảnh</div>
                          <div className="mt-1 text-brand-text-muted">{scene.background}</div>
                        </div>
                        <div>
                          <div className="font-black text-brand-text-title">Hành động</div>
                          <div className="mt-1 text-brand-text-muted">{scene.action}</div>
                        </div>
                        <div>
                          <div className="font-black text-brand-text-title">Biểu cảm</div>
                          <div className="mt-1 text-brand-text-muted">{scene.expression}</div>
                        </div>
                        <div>
                          <div className="font-black text-brand-text-title">Góc máy</div>
                          <div className="mt-1 text-brand-text-muted">{scene.camera}</div>
                        </div>
                      </div>
                    </details>

                    <div className="space-y-4 p-4">
                      <div className="rounded-xl border border-brand-border bg-[#08111f] p-3 text-white">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-black uppercase text-brand-blue-light">
                            Prompt video 3D tiếng Anh
                          </span>
                          <Button
                            onClick={() => copyToClipboard(scene.videoPrompt, promptKey)}
                            className="h-9 bg-white/10 px-3 text-xs text-white hover:bg-white/20"
                          >
                            {copiedKey === promptKey ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            Sao chép
                          </Button>
                        </div>
                        <details className="group mt-2">
                          <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/15 [&::-webkit-details-marker]:hidden">
                            <span>Xem nội dung prompt</span>
                            <span className="group-open:hidden">Mở rộng</span>
                            <span className="hidden group-open:inline">Thu gọn</span>
                          </summary>
                          <p className="mt-3 max-h-48 overflow-y-auto px-1 pr-2 font-mono text-xs leading-5 text-white/85">
                            {scene.videoPrompt}
                          </p>
                        </details>
                      </div>

                      <div className="rounded-xl border-l-4 border-brand-yellow bg-brand-yellow-light/45 p-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-xs font-black uppercase text-brand-text-title">
                            Lời thoại tiếng Việt
                          </span>
                          <Button
                            onClick={() => copyToClipboard(scene.voiceScript, voiceKey)}
                            className="h-9 border border-brand-blue bg-white px-3 text-xs text-brand-blue"
                          >
                            {copiedKey === voiceKey ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            Sao chép
                          </Button>
                        </div>
                        <p className="text-sm font-semibold leading-6">“{scene.voiceScript}”</p>
                      </div>

                      <Button
                        onClick={() =>
                          copyToClipboard(
                            'Prompt video:\n' +
                              scene.videoPrompt +
                              '\n\nLời thoại:\n' +
                              scene.voiceScript,
                            'all-' + index,
                          )
                        }
                        className="min-h-11 w-full bg-brand-yellow px-4 text-brand-text-title hover:bg-brand-yellow-light"
                      >
                        <Copy className="h-4 w-4" />
                        Sao chép prompt + lời thoại
                      </Button>
                    </div>
                  </article>
                );
              })}
            </>
          )}

          {history.length > 0 && (
            <div className="card">
              <h3 className="mb-3 font-black text-brand-text-title">Kịch bản gần đây</h3>
              <div className="space-y-2">
                {history.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCurrentResult(item)}
                    className="w-full rounded-xl border border-brand-border p-3 text-left hover:border-brand-blue"
                  >
                    <span className="line-clamp-1 block font-bold">
                      {item.inputs.topic || item.summary}
                    </span>
                    <span className="mt-1 block text-xs text-brand-text-muted">
                      {new Date(item.timestamp).toLocaleString('vi-VN')} · {item.scenes.length} cảnh
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
