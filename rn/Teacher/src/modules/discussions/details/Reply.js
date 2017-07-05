/* @flow */

import React, { Component } from 'react'
import {
  Image,
  View,
  StyleSheet,
  ActionSheetIOS,
  TouchableHighlight,
} from 'react-native'
import { Text, BOLD_FONT } from '../../../common/text'
import { LinkButton, Button } from '../../../common/buttons'
import colors from '../../../common/colors'
import Images from '../../../images'
import Avatar from '../../../common/components/Avatar'
import { formattedDate } from '../../../utils/dateUtils'
import WebContainer from '../../../common/components/WebContainer'
import i18n from 'format-message'
import Navigator from '../../../routing/Navigator'

export type Props = {
  reply: DiscussionReply,
  depth: number,
  participants: { [key: string]: UserDisplay },
  courseID: string,
  discussionID: string,
  deleteDiscussionEntry: Function,
  replyToEntry: Function,
  onPressMoreReplies: Function,
  myPath: number[],
  navigator: Navigator,
  maxReplyNodeDepth: number,
  isRootReply?: boolean,
}

export default class Reply extends Component <any, Props, any> {

  showAttachment = () => {
    if (this.props.reply.attachment) {
      this.props.navigator.show('/attachment', { modal: true }, {
        attachment: this.props.reply.attachment,
      })
    }
  }

  _userFromParticipants (reply: DiscussionReply, participants: { [key: string]: UserDisplay }): UserDisplay {
    let user = participants[reply.user_id ? reply.user_id : reply.editor_id]
    if (!user) {
      user = {
        id: '0',
        display_name: i18n('Unknown Author'),
        avatar_image_url: '',
        avatar_url: '',
        short_name: '',
        html_url: '',
      }
    }
    return user
  }

  render () {
    let { reply, depth, participants, courseID, discussionID, replyToEntry, onPressMoreReplies, maxReplyNodeDepth } = this.props
    participants = participants || {}
    let replies = reply.replies || []

    let childReplies = (depth > maxReplyNodeDepth - 1) ? [] : replies.map((r, i) => <Reply maxReplyNodeDepth={maxReplyNodeDepth} onPressMoreReplies={onPressMoreReplies} replyToEntry={replyToEntry} myPath={[...this.props.myPath, i]} deleteDiscussionEntry={this.props.deleteDiscussionEntry} courseID={courseID} discussionID={discussionID} participants={participants} reply={r} depth={depth + 1} key={r.id} navigator={this.props.navigator}/>)
    let user = this._userFromParticipants(reply, participants)
    let message = reply.deleted ? `<i style="color:${colors.grey4}">${i18n('Deleted this reply.')}</i>` : reply.message

    return (
      <View style={style.parentRow}>
        <View style={style.colA}>
          {user &&
          <Avatar height={AVATAR_SIZE} key={user.id} avatarURL={user.avatar_image_url} userName={user.id === '0' ? i18n('?') : user.display_name} style={style.avatar}/> }
          <View style={style.threadLine}/>
        </View>

        <View style={style.colB}>
          <View style={style.rowA}>
            {user &&
              <Text
                style={style.userName}
                accessibilityTraits={this.props.isRootReply ? 'header' : 'none'}
              >
                {user.display_name}
              </Text>
            }
            <Text style={style.date}>{formattedDate(reply.updated_at)}</Text>
            <WebContainer scrollEnabled={false} style={{ flex: 1 }} html={message}/>

            {reply.attachment &&
              <TouchableHighlight testID={`discussion-reply.${reply.id}.attachment`} onPress={this.showAttachment}>
                <View style={style.attachment}>
                  <Image source={Images.attachment} style={style.attachmentIcon} />
                  <Text style={style.attachmentText}>
                    {reply.attachment.display_name}
                  </Text>
                </View>
              </TouchableHighlight>
            }

            {reply.deleted && <View style={{ marginTop: global.style.defaultPadding }}/>}
            {(!reply.deleted) && this._renderButtons()}
            {this._renderMoreRepliesButton(depth, reply, maxReplyNodeDepth)}

          </View>

          <View style={style.rowB}>
            {childReplies}
          </View>
        </View>
      </View>
    )
  }

  _renderMoreRepliesButton = (depth: number, reply: DiscussionReply, maxReplyNodeDepth: number) => {
    let showMoreButton = depth === maxReplyNodeDepth
    let replies = reply.replies || []
    if (!(showMoreButton && replies.length > 0)) { return (<View/>) }
    let repliesText = i18n('View more replies')
    return (
      <View style={style.moreContainer}>
        <Button containerStyle={style.moreButtonContainer} style={style.moreButton} onPress={this._actionMore} accessibilityLabel={repliesText} testID='discussion.more-replies'>
          {repliesText}
        </Button>
      </View>
    )
  }

  _renderButtons = () => {
    return (
      <View style={style.footerContainer}>
       <LinkButton style={style.footer} textAttributes={{ fontWeight: '500', color: colors.grey4 }} onPress={this._actionReply} testID='discussion.reply-btn'>
            {i18n('Reply')}
        </LinkButton>
        <Text style={[style.footer, { color: colors.grey2, textAlign: 'center', alignSelf: 'center', paddingLeft: 10, paddingRight: 10 }]} accessible={false}>|</Text>
        <LinkButton style={style.footer} textAttributes={{ fontWeight: '500', color: colors.grey4 }} onPress={this._actionEdit} testID='discussion.edit-btn'>
            {i18n('Edit')}
        </LinkButton>
      </View>
    )
  }

  _actionMore = () => {
    this.props.onPressMoreReplies(this.props.myPath)
  }

  _actionReply = () => {
    this.props.replyToEntry(this.props.reply.id, this.props.myPath)
  }
  _actionEdit = () => {
    const { courseID, discussionID } = this.props
    let options = []
    options.push(i18n('Edit'))
    options.push(i18n('Delete'))
    options.push(i18n('Cancel'))
    ActionSheetIOS.showActionSheetWithOptions({
      options: options,
      cancelButtonIndex: options.length - 1,
      destructiveButtonIndex: options.length - 2,
    }, (button) => {
      if (button === (options.length - 1)) { return }
      if (button === (options.length - 2)) { this.props.deleteDiscussionEntry(courseID, discussionID, this.props.reply.id, this.props.myPath); return }
      if (button === 0) {
        this.props.navigator.show(`/courses/${this.props.courseID}/discussion_topics/${this.props.discussionID}/reply`, { modal: true }, { message: this.props.reply.message, entryID: this.props.reply.id, isEdit: true, parentIndexPath: this.props.myPath })
        return
      }
    })
  }
}

const AVATAR_SIZE = 24
const style = StyleSheet.create({
  parentRow: {
    flex: 1,
    flexDirection: 'row',
  },
  colA: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 0,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    flex: 0.1,
  },
  colB: {
    flex: 1,
  },
  rowA: {
    alignSelf: 'stretch',
    marginTop: global.style.defaultPadding / 1.25,
  },
  rowB: {
    flex: 1,
    alignSelf: 'stretch',
  },
  threadLine: {
    backgroundColor: colors.grey1,
    width: 1,
    flex: 1,
  },
  avatar: {
    height: AVATAR_SIZE,
    width: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.grey1,
    marginTop: global.style.defaultPadding / 1.25,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  date: {
    color: colors.grey4,
    fontSize: 12,
    marginBottom: global.style.defaultPadding,
  },
  footer: {
    padding: 2,
    alignSelf: 'flex-end',
  },
  footerContainer: {
    marginTop: global.style.defaultPadding,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  moreContainer: {
    marginTop: global.style.defaultPadding,
    marginBottom: global.style.defaultPadding,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    height: 27,
    flex: 1,
    paddingRight: global.style.defaultPadding,
  },
  moreButton: {
    fontSize: 12,
    fontWeight: 'normal',
    color: colors.grey4,
  },
  moreButtonContainer: {
    backgroundColor: colors.grey1,
    borderColor: colors.grey2,
    borderWidth: 1,
    borderRadius: 4,
    flex: 1,
    padding: 5,
  },
  attachment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentIcon: {
    tintColor: colors.link,
  },
  attachmentText: {
    color: colors.link,
    fontFamily: BOLD_FONT,
    marginLeft: 6,
    fontSize: 14,
  },
})
