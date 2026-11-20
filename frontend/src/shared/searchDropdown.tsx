import { useEffect, useMemo, useState, type RefObject } from "react";
import type { SearchDropdownProps } from "../entities/dataInterfaces";
import { handleKeyWithKeyMap } from "../entities/keyHandler";

/**
 * `SearchDropdown` component for dropdown search suggestions
 * @param dropdownData - Array of suggetions
 * @param searchFunc - function to run search(like on enter)
 * @param setValue - function to set suggetion as value
 * @param value - input's value
 * @param inputRef - input's ref
 */
export function SearchDropdown({ dropdownData, searchFunc, setValue, search, inputElRef }: SearchDropdownProps) {
    const [focusedSuggestion, setFocusedSuggestion] = useState<number>(0)
    const keyMap = useMemo(() => ({
        'ArrowDown': (e) => { setFocusedSuggestion(prev => (prev + 1) % dropdownData.length) },
        'ArrowUp': e => { setFocusedSuggestion(prev => (prev - 1 + (prev < 1 ? dropdownData.length : 0))); e.preventDefault(); },
        'ctrl+Enter': e => { searchFunc(); e.preventDefault() },
        'Enter': e => { setValue(dropdownData[focusedSuggestion]); e.preventDefault() },
        'Escape': e => { inputElRef.current.blur() }
    }), [dropdownData, focusedSuggestion]);
    useEffect(() => {
        const searchSuggetionsControl = (e: KeyboardEvent) => {
            handleKeyWithKeyMap(e, keyMap)
        }
        document.querySelectorAll(".ss")[focusedSuggestion]?.scrollIntoView();
        inputElRef.current.addEventListener('keydown', searchSuggetionsControl);
        return () => { inputElRef.current?.removeEventListener('keydown', searchSuggetionsControl) }
    }, [dropdownData, focusedSuggestion])
    if (!search || dropdownData.length == 0)
        return (null);
    else
        return (
            <div className="flex rounded-xl m-auto flex-col bg-base w-4/5 p-1 max-h-[15vh] overflow-y-scroll scrollbar-none" >
                {dropdownData.map((ss, idx) =>
                    <span key={ss} className={"ss text-subtext0" + (focusedSuggestion == idx ? ' bg-surface0' : '')} onMouseEnter={() => setFocusedSuggestion(idx)} onMouseDown={() => setValue(ss)} >{ss}</span>
                )}
            </div>
        )
}
