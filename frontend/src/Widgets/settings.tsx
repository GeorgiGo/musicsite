import { useMemo } from "react";
import { SettingsSVG } from "../shared/svgIcons";
import { useSettings } from "../entities/contexts/SettingsContext";

export default function SettingsField({ curTab, setCurTab }) {

    return (
        <label className="group relative p-2 w-fit ">
            <input
                name='tab' type="radio"
                checked={curTab == 'SETTINGS'}
                onChange={() => setCurTab('SETTINGS')}
                className="sr-only peer" />
            < SettingsSVG className='pointer-events-none text-mauve' width='50px' height='50px' />
            <div className="peer-checked:h-2/3 w-2 h-0 group-hover:h-1/3 bg-surface1 absolute top-1/2 left-0 -translate-1/2"></div>
            <span className="left-full bottom-1/2 translate-y-1/2 absolute mb-0
                        pointer-events-none select-none opacity-0 scale-95 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:scale-100
                        px-2 py-0.5 text-[small] font-medium text-text bg-base border border-surface0 rounded-md rounded-bl-none shadow-xl
        whitespace-nowrap pointer-events-none
 ">Настройки (I)</span>
        </label>
    )
}
export function SettingsTab({ curTab }) {
    const { showVisualizer, setShowVizualizer, hideSongList, showCoverOnBack, setShowCoverOnBack, setHideSongList } = useSettings()
    return (
        <div style={{ display: (curTab === 'SETTINGS' ? 'block' : 'none') }} className="backdrop-blur-[12px] bg-[#181825af] h-full w-fit m-auto text-text p-8 mt-3">
            <h1 className="text-xl font-bold m-auto w-fit text-[x-large] text-shadow-[0_0_4px_var(--color-text)] mb-3">-- Настройки --</h1>
            <div className="m-auto w-fit flex items-center flex-col">
                <ChooseSetting showTypes={['Авто', 'Всегда', 'Никогда']} name='Показывать визуализатор' types={['SHOW', 'ALWAYS', 'NEVER']} setFunction={(e) => setShowVizualizer(['SHOW', 'ALWAYS', 'NEVER'][e])} curType={showVisualizer} />
                <ChooseSetting showTypes={['Показан', 'Полупрозрачен', 'Скрыт']} name='Список песен, когда не в фокусе' types={['SHOW', 'OPACITY', 'HIDE']} setFunction={(e) => setHideSongList(['SHOW', 'OPACITY', 'HIDE'][e])} curType={hideSongList} />
                <CheckSetting name='Показывать обложку песни на заднем фоне' setFunction={(b: boolean) => setShowCoverOnBack(b)} curType={showCoverOnBack} />
            </div>
        </div>
    )
}
interface CheckSettingProps {
    name: string,
    setFunction: (e: boolean) => void,
    curType: Boolean
}
function CheckSetting({ name, setFunction, curType }: CheckSettingProps) {
    return (
        <div className="select-none text-[large] flex flex-row">
            <span>{name}: </span>
            <span className="text-blue py-1 px-2 rounded-2xl hover:font-bold hover:bg-surface0">
                {curType == true ?
                    <svg className="scale-120" xmlns="http://www.w3.org/2000/svg"
                        onClick={() => setFunction(false)}
                        width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

                        <path d="M20 6 9 17l-5-5" /></svg> :
                    <svg className="scale-120" xmlns="http://www.w3.org/2000/svg"
                        onClick={() => setFunction(true)}
                        width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" >
                        <path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>}
            </span>
        </div>
    )
}
interface ChooseSettingProps {
    name: string,
    types: any[],
    showTypes: string[],
    setFunction: (e: any) => void,
    curType: any
}
function ChooseSetting({ name, types, showTypes, setFunction, curType }: ChooseSettingProps) {
    const curIdx = useMemo(() => { return types.findIndex(el => el == curType) }, [curType, types]);
    return (
        <div className="select-none text-[large]">
            <span>{name}: </span>
            <span onClick={() => setFunction((curIdx + 1) % types.length)} className="text-blue py-1 px-2 rounded-2xl hover:font-bold hover:bg-surface0">{showTypes[curIdx]}</span>
        </div>
    )
}
