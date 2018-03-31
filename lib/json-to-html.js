/* global atom */

'use babel'

import { CompositeDisposable } from 'atom'
import JSON5 from 'json5'
import { Base64 } from 'js-base64'

export default {

  subscriptions: null,

  activate() {
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'json-to-html:toggle': () => this.toggle()
    }))
  },

  deactivate() {
    this.subscriptions.dispose()
  },

  toggle() {
    const editor = atom.workspace.getActiveTextEditor()
    const selection = editor.getLastSelection()
    const selectedRawText = selection.getText()
    const selectedText = selectedRawText || ''

    if (
      !selectedText ||
      (selectedText[0] !== '[' && selectedText[0] !== '{')
    ) return

    try {
      if (/^[[{]<!--DONT-REMOVE.+/.test(selectedText)) { // Decode
        const rawText = selectedText.match(/<!--DONT-REMOVE:(.+)-->/)[1]
        selection.deleteSelectedText()
        selection.insertText(Base64.decode(rawText))
      } else { // Encode
        const obj = JSON5.parse(selectedText)
        const flag = '<<:BR:>>'
        const html = (
          JSON
            .stringify(obj, null, flag)
            .replace(new RegExp(flag, 'g'), '&nbsp;&nbsp;&nbsp;&nbsp;')
            .replace(/(\r|\n)+/g, '<br />')
            .replace(/^(\[|\{)/, `$1<!--DONT-REMOVE:${Base64.encode(selectedRawText)}-->`)
        )
        selection.deleteSelectedText()
        selection.insertText(html)
      }
    } catch (e) {}
  }
}
