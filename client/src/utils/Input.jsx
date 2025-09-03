export const Action = {
    Left: "Left",
    FastDrop: "FastDrop",
    Pause: "Pause",
    Quit: "Quit",
    Right: "Right",
    Rotate: "Rotate",
    SlowDrop: "SlowDrop",
    ExtraFrame: "ExtraFrame"
}

export const Key = {
    ArrowUp: Action.Rotate,
    ArrowDown: Action.SlowDrop,
    ArrowLeft: Action.Left,
    ArrowRight: Action.Right,
    KeyQ: Action.Quit,
    Space: Action.FastDrop
}

export const actionIsDrop = (action) =>
    [Action.SlowDrop, Action.FastDrop].includes(action);
export const actionForKey = (keyCode) => Key[keyCode];