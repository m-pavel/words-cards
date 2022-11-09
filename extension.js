/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const Lang = imports.lang;
const Mainloop = imports.mainloop;
const MessageTray = imports.ui.messageTray;
const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const Shell = imports.gi.Shell;
const GLib = imports.gi.GLib;
const ExtensionUtils = imports.misc.extensionUtils;

const MIN_INTERVAL = 30
const MAX_INTERVAL = 2700

class Extension {
    constructor() {

    }

    enable() {
        this.init();
    }

    disable() {
    }

    _showNotification(title, message) {
        let source = new MessageTray.Source("Words cards", 'emoji-objects-symbolic');
        Main.messageTray.add(source);
        let notification = new MessageTray.Notification(source, title, message);
        notification.setTransient(true);
        source.showNotification(notification);
    }

    destroy() {
        if (this._notifSource) {
            this._notifSource.destroy();
            this._notifSource = null;
        };
    }

    readData() {
        let metadata = ExtensionUtils.getCurrentExtension();
        let config_file = metadata.path + "/words.csv";
        this.data = [];
        if (GLib.file_test(config_file, GLib.FileTest.EXISTS))
        {
            try
            {
                let re = /^([^;]+);(.*)/;
                let matches;
                let config_data = Shell.get_file_contents_utf8_sync(config_file).split(/\n/);
                for (let line = 0;  line < config_data.length;  ++line)
                {
                    if (config_data[line].length  &&  (matches = re.exec(config_data[line])) != null) 
                    {
                        this.data.push({a: matches[1], b: matches[2]});
                    } else {
                        log("EXT", "no match "+config_data[line]);
                    }
                }
            }
            catch (err)
            {
                log("EXT", err);
            }
        } else {
            log("Not exist", config_file)
        }
    }

    init() {
        this.readData();
        this.schedule();
    }

    showWord() {
        let i = Math.floor(Math.random() * this.data.length);
        let en = this.data[i];
        this._showNotification(en.a, en.b);
        this.schedule();
    }


    schedule()  {
        let interval = MIN_INTERVAL + Math.floor(Math.random() * MAX_INTERVAL);
        Mainloop.timeout_add_seconds(interval, Lang.bind(this, this.showWord));
    }

}

function init() {
    return new Extension();
}
