'use babel'
import React from 'react'
import { Link } from 'react-router'
import app from './lib/app'
import Notifications from './com/msg-list/notifications'
import Bookmarks from './com/msg-list/bookmarks'
import ModalFlow from './com/modals/flow'
import ProfileSetup from './com/forms/profile-setup'
import FollowNearby from './com/forms/follow-nearby'
import PubInvite from './com/forms/pub-invite'
import Issues from './com/issues'

const SETUP_LABELS = [<i className="fa fa-user"/>, <i className="fa fa-wifi"/>, <i className="fa fa-cloud"/>]
const SETUP_FORMS = [ProfileSetup, FollowNearby, PubInvite]
const RIGHT_NAVS = {
  notifications: Notifications,
  bookmarks: Bookmarks
}

export default class Layout extends React.Component {
  constructor(props) {
    super(props)
    this.state = this.buildState()

    // listen for app change-events that should update our state
    const refresh = () => { this.setState(this.buildState()) }
    app.on('update:all', refresh)
    app.on('update:indexCounts', refresh)
    app.on('update:isWifiMode', refresh)
    app.on('modal:setup', (isOpen) => this.setState({ setupIsOpen: isOpen }))
  }
  componentWillReceiveProps() {
    // update state on view changes
    app.fetchLatestState()
  }
  buildState() {
    // copy over app state
    return {
      rightNav: (this.state) ? this.state.rightNav : false,
      isWifiMode: app.isWifiMode,
      indexCounts: app.indexCounts||{},
      user: app.user,
      users: app.users,
      setupIsOpen: app.user.needsSetup,
      setupCantClose: app.user.needsSetup,
      isComposerOpen: app.isComposerOpen
    }
  }

  toggleRightNav(id) {
    if (this.state.rightNav == id)
      this.setState({ rightNav: false })
    else
      this.setState({ rightNav: id })
  }

  onClickBack() {
    window.history.back()
  }

  render() {
    const location = this.props.location.pathname
    const isWifiMode = this.state.isWifiMode
    const onToggleRightNav = (id) => () => { this.toggleRightNav(id) }
    const composing = this.state.isComposerOpen
    const RightNavView = (this.state.rightNav) ? RIGHT_NAVS[this.state.rightNav] : null

    const NavLink = (props) => {
      const selected = (props.to === location)
      const cls = 'ctrl '+(selected?'selected':'')
      const count = props.count ? <div className="count">{props.count}</div> : ''
      return <Link className={cls} to={props.to}><i className={'fa fa-'+props.icon} /><span className="label">{props.label}</span> {count}</Link>
    }
    const NavToggle = (props) => {
      const selected = (props.to === this.state.rightNav)
      const cls = 'ctrl '+(selected?'selected':'')
      const count = props.count ? <div className="count">{props.count}</div> : ''
      return <a className={cls} onClick={onToggleRightNav(props.to)}><i className={'fa fa-'+props.icon} /> {count}</a>
    }

    return <div className="layout-rows">
      <ModalFlow fullheight labels={SETUP_LABELS} Forms={SETUP_FORMS} isOpen={this.state.setupIsOpen} cantClose={this.state.setupCantClose} />
      <div className="toolbar flex">
        <div className="flex-fill">
          <a className="ctrl back" onClick={this.onClickBack}><i className="fa fa-angle-left" /></a>
          <div className="nav">
            <NavLink to="/" icon="newspaper-o" label="Feed" />
            <NavLink to="/inbox" icon="inbox" label="Inbox" count={this.state.indexCounts.inboxUnread} />
            <NavLink to="/profile" icon="users" label="Contacts" />
            <NavLink to="/sync" icon={isWifiMode?'wifi':'globe'} label='Network' />
            <Issues />
          </div>
        </div>
        <div>
          <div className="search"><i className="fa fa-search" /><input /></div>
          <NavToggle to="bookmarks" icon="bookmark-o" count={this.state.indexCounts.bookmarksUnread} />
          <NavToggle to="notifications" icon="bell-o" count={this.state.indexCounts.notificationsUnread} />
        </div>
      </div>
      <div className="layout-columns">
        <div id="mainview">{this.props.children}</div>
        { (RightNavView) ? <div id="rightnav"><RightNavView /></div> : '' }
      </div>
    </div>
  }
}