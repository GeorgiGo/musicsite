/**
 * handles the keys
 * @param event`KeyboardEvent`
 * @param keyMap The map like `key`: `function(event:KeyboardEvent)`, 
 * key must be writen as it in `e.code`, & many keys are writen like `"ctrl+Enter"`
 */
export function handleKeyWithKeyMap(event: KeyboardEvent, keyMap: {}) {
    const getKeyStr = (e: KeyboardEvent) => {
        const parts = [];
        if (e.ctrlKey) parts.push('ctrl')
        parts.push(e.code)
        return parts.join('+')
    };
    const action = keyMap[getKeyStr(event)]
    if (action) action(event)
}
