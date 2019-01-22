
const actions = {
  // web socket handler
  /* [types.HANDLE_WS_TAGREAD]({state, commit, dispatch}, tagId) {
    let tag = state.tags.find(tag => tag.id === tagId)
    const isNewTag = !tag
    if (state.recording && isNewTag) {
      const startOffset = Date.now() - state.recording
      tag = {
        id: tagId,
        start: startOffset,
        end: startOffset + tagClipDuration,
        note: ''
      }
      commit(types.POST_TAG, tag)
    }
    commit(types.SET_ACTIVETAG, tag)
  },
  [types.HANDLE_WS_TAGREMOVED]({state, commit}) {
    commit(types.SET_ACTIVETAG, null)
  } */
}

export default actions
