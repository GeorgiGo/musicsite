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
    const { showVisualizer, setShowVizualizer } = useSettings()
    return (
        <div style={{ display: (curTab === 'SETTINGS' ? 'block' : 'none') }} className="h-full w-full text-text p-8 mt-3">
            <h1 className="text-xl font-bold m-auto w-fit text-[x-large] text-shadow-[0_0_4px_var(--color-text)] mb-3">-- Настройки --</h1>
            <div className="m-auto w-fit">
                <ChooseSetting showTypes={['Авто', 'Всегда', 'Никогда']} name='Показывать визуализатор' types={['SHOW', 'ALWAYS', 'NEVER']} setFunction={(e) => setShowVizualizer(['SHOW', 'ALWAYS', 'NEVER'][e])} curType={showVisualizer} />
            </div>
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
