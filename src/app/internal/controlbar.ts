/// <reference path='../../ui/ui.ts' />

namespace svjs.app.__internal {

export class VideoControls {
    public button_fullscreen: svjs.ui.Button;
    public button_play: svjs.ui.Button;
    public button_settings: svjs.ui.Button;

    public control_bar: svjs.ui.ControlBar;

    public constructor() {
        this.button_fullscreen = new svjs.ui.Button('icon-fullscreen');
        this.button_play = new svjs.ui.Button('icon-play');
        this.button_settings = new svjs.ui.Button('icon-settings');

        this.control_bar = new svjs.ui.ControlBar();
        this.control_bar.AddButton(new ui.ButtonGroup('svjs-float-left')
                                         .Add(this.button_play));
        this.control_bar.AddButton(new ui.ButtonGroup('svjs-float-right')
                                         .Add(this.button_settings)
                                         .Add(this.button_fullscreen));
    }

    get RootElement(): ui.dom.Div {
        return this.control_bar.GetElement();
    }
}

} // namespace svjs::app::__internal
