/// <reference path='../../ui/ui.ts' />
/// <reference path='../../options.ts' />

namespace svjs.app.__internal {

class ViewMenu {
    public menu: ui.Panel;

    public constructor(stereo: boolean) {
        const lbl_img = stereo ? 'Left View' : 'Original';
        const lbl_dpt = stereo ? 'Right View' : 'Depth Map';

        this.view_callback_ = null;
        this.options_ = [
            ['image', new ui.PanelButton(lbl_img)],
            ['depth', new ui.PanelButton(lbl_dpt)],
            ['anaglyph', new ui.PanelButton('Anaglyph')],
            ['side-by-side', new ui.PanelButton('Side-by-Side')]
        ];

        this.menu = new ui.Panel('svjs-options-popup-view', 'Display Type');
        for (let btn of this.options_) {
            this.menu.AddItem(btn[1]);
            btn[1].AddCallback(() => {
                if (this.view_callback_) {
                    this.view_callback_(btn[0]);
                }
            });
        }
    }

    public SetCallback(cb: (type: string) => void) {
        this.view_callback_ = cb;
    }

    private options_: [string, ui.PanelButton][];
    private view_callback_: (type: string) => void;
}

class DBIRMenu {
    public menu: ui.Panel;

    public constructor(conf: SVConfig) {
        const default_bias  = conf.bias.default ? conf.bias.default : 0;
        const default_scale = conf.scale.default ? conf.scale.default : 1;

        this.current_ = { scale: default_scale, bias: default_bias };
        this.options_ = {
            scale: new ui.PanelSlider('Scale', conf.scale),
            bias: new ui.PanelSlider('Bias', conf.bias)
        };
        const btn_reset = new ui.PanelButton('Reset');
        btn_reset.AddSeparator(true);

        // add the items to the panel
        this.menu = new ui.Panel('svjs-options-popup-dbir', 'Depth Adjustment');
        for (let opt in this.options_) {
            if (this.options_.hasOwnProperty(opt)) {
                this.menu.AddItem(this.options_[opt]);
                this.options_[opt].Value = this.current_[opt];
            }
        }
        this.menu.AddItem(btn_reset);

        // set callbacks on second pass to avoid any accidental calls
        for (let opt in this.options_) {
            if (this.options_.hasOwnProperty(opt)) {
                this.options_[opt].AddCallback((value: number) => {
                    this.current_[opt] = value;
                    if (this.adjust_callback_) {
                        this.adjust_callback_(this.current_.scale,
                                              this.current_.bias);
                    }
                });
            }
        }
        btn_reset.AddCallback(() => {
            this.current_.scale = default_scale;
            this.current_.bias = default_bias;
            this.options_.scale.Value = default_scale;
            this.options_.bias.Value = default_bias;
            if (this.adjust_callback_) {
                this.adjust_callback_(this.current_.scale, this.current_.bias);
            }
        });
    }

    public SetCallback(cb: (scale: number, bias: number) => void) {
        this.adjust_callback_ = cb;
    }

    private options_: { scale: ui.PanelSlider, bias: ui.PanelSlider };
    private adjust_callback_: (scale: number, bias: number) => void;
    private current_: {scale: number, bias: number};
}

const kAboutHTML =
    '<h1>stereovideo.js</h1>' +
    'An HTML5 video player for stereoscopic content.' +
    '<p/>' +
    'Using Google\'s <a href="https://design.google.com/icons/">Material ' +
    'Design Icons</a>.';

class AboutMenu {
    public menu: ui.Panel;

    public constructor() {
        this.menu = new ui.Panel('svjs-options-popup-about', 'About');
        this.menu.AddItem(new ui.PanelText(kAboutHTML));
    }
}

export class OptionsPopup {
    public panel: ui.Panel;

    public view_menu: ViewMenu;
    public dbir_menu: DBIRMenu;
    public about_panel: AboutMenu;

    public constructor(opts: SVConfig) {
        this.panel = new ui.Panel('svjs-options-popup', 'Options');

        this.view_menu = new ViewMenu(opts.stereo);
        this.dbir_menu = new DBIRMenu(opts);
        this.about_panel = new AboutMenu();

        this.panel.AddItem(this.view_menu.menu);
        if (!opts.stereo) {
            this.panel.AddItem(this.dbir_menu.menu);
        }
        this.panel.AddItem(this.about_panel.menu);
    }

    get RootElement(): ui.dom.Div {
        return this.panel.GetElement();
    }
}

} // namespace svjs::app::__internal
