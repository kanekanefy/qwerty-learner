import styles from './index.module.css'
import { defaultFontSizeConfig } from '@/constants'
import { dyslexiaConfigAtom, fontSizeConfigAtom, practiceMediaConfigAtom, viewPreferenceConfigAtom } from '@/store'
import type { ViewContrastThemeOption, ViewFontFamilyOption } from '@/typings'
import { Listbox, Switch, Transition } from '@headlessui/react'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import * as Slider from '@radix-ui/react-slider'
import { useAtom } from 'jotai'
import type { CSSProperties } from 'react'
import { Fragment, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import IconCheck from '~icons/tabler/check'
import IconChevronDown from '~icons/tabler/chevron-down'

type FontOption = {
  value: ViewFontFamilyOption
  label: string
  description: string
  previewText: string
  previewStyle: CSSProperties
}

type ContrastOption = {
  value: ViewContrastThemeOption
  label: string
  description: string
  previewStyle: CSSProperties
}

const fontFamilyOptions: FontOption[] = [
  {
    value: 'system',
    label: '系统默认字体',
    description: '保持原有等宽英文和常用中文字体组合。',
    previewText: 'Aa',
    previewStyle: {
      fontFamily: "'JetBrains Mono', 'Fira Mono', 'Menlo', 'Consolas', 'Courier New', monospace",
      letterSpacing: '0em',
    },
  },
  {
    value: 'opendyslexic',
    label: 'OpenDyslexic',
    description: '阅读障碍友好字体，增大字母底部重心与区分度。',
    previewText: 'Aa',
    previewStyle: {
      fontFamily: "'OpenDyslexic', 'Lexend', 'Atkinson Hyperlegible', sans-serif",
      letterSpacing: '0.065em',
    },
  },
]

const contrastOptions: ContrastOption[] = [
  {
    value: 'default',
    label: '标准主题',
    description: '沿用浅色背景与柔和对比度。',
    previewStyle: {
      background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
    },
  },
  {
    value: 'soft',
    label: '柔和护眼',
    description: '暖黄背景降低蓝光，适合长时间练习。',
    previewStyle: {
      background: 'linear-gradient(135deg, #fff7d6 0%, #fde68a 100%)',
    },
  },
  {
    value: 'high',
    label: '高对比度',
    description: '深色背景与亮字色，突出字形轮廓。',
    previewStyle: {
      background: 'linear-gradient(135deg, #020617 0%, #1e293b 100%)',
    },
  },
]

export default function ViewSetting() {
  const [fontSizeConfig, setFontsizeConfig] = useAtom(fontSizeConfigAtom)
  const [viewPreferenceConfig, setViewPreferenceConfig] = useAtom(viewPreferenceConfigAtom)
  const [practiceMediaConfig, setPracticeMediaConfig] = useAtom(practiceMediaConfigAtom)
  const [dyslexiaConfig, setDyslexiaConfig] = useAtom(dyslexiaConfigAtom)

  const selectedFontOption = useMemo(
    () => fontFamilyOptions.find((option) => option.value === viewPreferenceConfig.fontFamily) ?? fontFamilyOptions[0],
    [viewPreferenceConfig.fontFamily],
  )

  const selectedContrastOption = useMemo(
    () => contrastOptions.find((option) => option.value === viewPreferenceConfig.contrastTheme) ?? contrastOptions[0],
    [viewPreferenceConfig.contrastTheme],
  )

  const onChangeForeignFontSize = useCallback(
    (value: [number]) => {
      setFontsizeConfig((prev) => ({
        ...prev,
        foreignFont: value[0],
      }))
    },
    [setFontsizeConfig],
  )

  const onChangeTranslateFontSize = useCallback(
    (value: [number]) => {
      setFontsizeConfig((prev) => ({
        ...prev,
        translateFont: value[0],
      }))
    },
    [setFontsizeConfig],
  )

  const onResetFontSize = useCallback(() => {
    setFontsizeConfig({ ...defaultFontSizeConfig })
  }, [setFontsizeConfig])

  const onChangeFontFamily = useCallback(
    (value: ViewFontFamilyOption) => {
      setViewPreferenceConfig((prev) => ({
        ...prev,
        fontFamily: value,
      }))
    },
    [setViewPreferenceConfig],
  )

  const onChangeContrastTheme = useCallback(
    (value: ViewContrastThemeOption) => {
      setViewPreferenceConfig((prev) => ({
        ...prev,
        contrastTheme: value,
      }))
    },
    [setViewPreferenceConfig],
  )

  const onToggleIllustration = useCallback(
    (checked: boolean) => {
      setPracticeMediaConfig((prev) => ({
        ...prev,
        isIllustrationEnabled: checked,
      }))
    },
    [setPracticeMediaConfig],
  )

  const onToggleDyslexiaMode = useCallback(
    (checked: boolean) => {
      setDyslexiaConfig((prev) => ({
        ...prev,
        isDyslexiaModeEnabled: checked,
      }))
    },
    [setDyslexiaConfig],
  )

  const onChangeTtsService = useCallback(
    (value: 'browser' | 'external') => {
      setDyslexiaConfig((prev) => ({
        ...prev,
        ttsService: value,
      }))
    },
    [setDyslexiaConfig],
  )

  const onToggleReadOutTypedLetters = useCallback(
    (checked: boolean) => {
      setDyslexiaConfig((prev) => ({
        ...prev,
        isReadOutTypedLettersEnabled: checked,
      }))
    },
    [setDyslexiaConfig],
  )

  return (
    <ScrollArea.Root className="flex-1 select-none overflow-y-auto ">
      <ScrollArea.Viewport className="h-full w-full px-3">
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>字体设置</span>
            <div className={styles.block}>
              <span className={styles.blockLabel}>阅读字体</span>
              <Listbox value={viewPreferenceConfig.fontFamily} onChange={onChangeFontFamily}>
                <div className="relative w-full sm:w-80">
                  <Listbox.Button className="listbox-button w-full">
                    <div className="ql-select-label">
                      <span className="ql-select-title text-sm font-medium text-gray-700 dark:text-gray-200">
                        {selectedFontOption.label}
                      </span>
                      <span className="ql-select-description text-xs font-normal text-gray-500 dark:text-gray-400">
                        {selectedFontOption.description}
                      </span>
                    </div>
                    <span className="ql-select-icon">
                      <IconChevronDown className="focus:outline-none" />
                    </span>
                  </Listbox.Button>
                  <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="listbox-options z-20">
                      {fontFamilyOptions.map((option) => (
                        <Listbox.Option key={option.value} value={option.value}>
                          {({ selected }) => (
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex flex-1 flex-col">
                                <span className="text-sm font-medium">{option.label}</span>
                                <span className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
                              </div>
                              <span className="min-w-[2.5rem] text-lg" style={option.previewStyle}>
                                {option.previewText}
                              </span>
                              {selected && (
                                <span className="listbox-options-icon">
                                  <IconCheck className="focus:outline-none" />
                                </span>
                              )}
                            </div>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
            <div className={styles.block}>
              <span className={styles.blockLabel}>外语字体</span>
              <div className="flex h-5 w-full items-center justify-between">
                <Slider.Root
                  value={[fontSizeConfig.foreignFont]}
                  min={20}
                  max={96}
                  step={4}
                  className="slider"
                  onValueChange={onChangeForeignFontSize}
                >
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumb />
                </Slider.Root>
                <span className="ml-4 w-10 text-xs font-normal text-gray-600">{fontSizeConfig.foreignFont}px</span>
              </div>
            </div>

            <div className={styles.block}>
              <span className={styles.blockLabel}>中文字体</span>
              <div className="flex h-5 w-full items-center justify-between">
                <Slider.Root
                  value={[fontSizeConfig.translateFont]}
                  max={60}
                  min={14}
                  step={4}
                  className="slider"
                  onValueChange={onChangeTranslateFontSize}
                >
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumb />
                </Slider.Root>
                <span className="ml-4 w-10 text-xs font-normal text-gray-600">{fontSizeConfig.translateFont}px</span>
              </div>
            </div>
            <div className={styles.block}>
              <span className={styles.blockLabel}>对比主题</span>
              <Listbox value={viewPreferenceConfig.contrastTheme} onChange={onChangeContrastTheme}>
                <div className="relative w-full sm:w-80">
                  <Listbox.Button className="listbox-button w-full">
                    <div className="ql-select-label">
                      <span className="ql-select-title text-sm font-medium text-gray-700 dark:text-gray-200">
                        {selectedContrastOption.label}
                      </span>
                      <span className="ql-select-description text-xs font-normal text-gray-500 dark:text-gray-400">
                        {selectedContrastOption.description}
                      </span>
                    </div>
                    <span className="ql-select-icon">
                      <IconChevronDown className="focus:outline-none" />
                    </span>
                  </Listbox.Button>
                  <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="listbox-options z-20">
                      {contrastOptions.map((option) => (
                        <Listbox.Option key={option.value} value={option.value}>
                          {({ selected }) => (
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex flex-1 flex-col">
                                <span className="text-sm font-medium">{option.label}</span>
                                <span className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
                              </div>
                              <span className="h-6 w-12 rounded-full border border-indigo-200" style={option.previewStyle}></span>
                              {selected && (
                                <span className="listbox-options-icon">
                                  <IconCheck className="focus:outline-none" />
                                </span>
                              )}
                            </div>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          </div>
          <button className="my-btn-primary ml-4 disabled:bg-gray-300" type="button" onClick={onResetFontSize} title="重置字体设置">
            重置字体设置
          </button>

          <div className={styles.section}>
            <span className={styles.sectionLabel}>图像辅助</span>
            <div className={styles.block}>
              <span className={styles.blockLabel}>单词示意图</span>
              <div className="flex w-full items-start justify-between gap-4">
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">启用 Unsplash 图库</span>
                  <span className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    自动搜索单词联想图片，会缓存 30 天；需在环境变量中配置 VITE_UNSPLASH_ACCESS_KEY。
                  </span>
                </div>
                <Switch checked={practiceMediaConfig.isIllustrationEnabled} onChange={onToggleIllustration} className="switch-root">
                  <span className="sr-only">切换单词示意图</span>
                  <span aria-hidden="true" className="switch-thumb" />
                </Switch>
              </div>
              <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">图片来源：Unsplash。切换将在下一次练习时生效。</p>
            </div>
          </div>

          <div className={styles.section}>
            <span className={styles.sectionLabel}>阅读障碍支持</span>
            <div className={styles.block}>
              <span className={styles.blockLabel}>启用阅读障碍模式</span>
              <div className="flex w-full items-start justify-between gap-4">
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">启用阅读障碍模式</span>
                  <span className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">为阅读障碍用户优化显示和交互。</span>
                </div>
                <Switch checked={dyslexiaConfig.isDyslexiaModeEnabled} onChange={onToggleDyslexiaMode} className="switch-root">
                  <span className="sr-only">切换阅读障碍模式</span>
                  <span aria-hidden="true" className="switch-thumb" />
                </Switch>
              </div>
            </div>
            <div className={styles.block}>
              <span className={styles.blockLabel}>文本转语音服务</span>
              <Listbox value={dyslexiaConfig.ttsService} onChange={onChangeTtsService}>
                <div className="relative w-full sm:w-80">
                  <Listbox.Button className="listbox-button w-full">
                    <div className="ql-select-label">
                      <span className="ql-select-title text-sm font-medium text-gray-700 dark:text-gray-200">
                        {dyslexiaConfig.ttsService === 'browser' ? '浏览器内置' : '外部服务'}
                      </span>
                    </div>
                    <span className="ql-select-icon">
                      <IconChevronDown className="focus:outline-none" />
                    </span>
                  </Listbox.Button>
                  <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="listbox-options z-20">
                      <Listbox.Option value="browser">
                        {({ selected }) => (
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-1 flex-col">
                              <span className="text-sm font-medium">浏览器内置</span>
                              <span className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">使用浏览器内置的语音合成API。</span>
                            </div>
                            {selected && (
                              <span className="listbox-options-icon">
                                <IconCheck className="focus:outline-none" />
                              </span>
                            )}
                          </div>
                        )}
                      </Listbox.Option>
                      <Listbox.Option value="external">
                        {({ selected }) => (
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-1 flex-col">
                              <span className="text-sm font-medium">外部服务</span>
                              <span className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">使用更高质量的外部文本转语音服务。</span>
                            </div>
                            {selected && (
                              <span className="listbox-options-icon">
                                <IconCheck className="focus:outline-none" />
                              </span>
                            )}
                          </div>
                        )}
                      </Listbox.Option>
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
            <div className={styles.block}>
              <span className={styles.blockLabel}>朗读按键字母</span>
              <div className="flex w-full items-start justify-between gap-4">
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">启用按键字母朗读</span>
                  <span className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">在打字时朗读您按下的每个字母。</span>
                </div>
                <Switch
                  checked={dyslexiaConfig.isReadOutTypedLettersEnabled}
                  onChange={onToggleReadOutTypedLetters}
                  className="switch-root"
                >
                  <span className="sr-only">切换按键字母朗读</span>
                  <span aria-hidden="true" className="switch-thumb" />
                </Switch>
              </div>
            </div>
            <div className={styles.block}>
              <Link to="/dashboard" className="my-btn-primary">
                查看仪表盘
              </Link>
            </div>{' '}
          </div>
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent " orientation="vertical"></ScrollArea.Scrollbar>
    </ScrollArea.Root>
  )
}
