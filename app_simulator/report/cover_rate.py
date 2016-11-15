# -*- coding: UTF-8 -*-

import leancloud
import datetime
import csv

from tab.tab_util import TabUtil


TOTAL_ACTIVITY = 600
TOP_ACTIVITY = [
    "com.tencent.mobileqq.conditionsearch.ConditionSearchFriendActivity",
    "com.tencent.mobileqq.activity.specialcare.SpecailCareListActivity",
    "com.tencent.mobileqq.activity.RegisterGuideActivity",
    "com.tencent.mobileqq.filemanager.fileviewer.TroopFileDetailBrowserActivity",
    "com.tencent.mobileqq.activity.UpgradeActivity",
    "com.tencent.mobileqq.activity.photo.PhotoListActivity",
    "com.tencent.mobileqq.activity.AddFriendLogicActivity",
    "com.tencent.mobileqq.vas.ChatBackgroundMarketActivity",
    "com.tencent.mobileqq.activity.richmedia.FlowCameraActivity2",
    "com.tencent.mobileqq.activity.photo.PhotoCropActivity",
    "com.tencent.mobileqq.dating.MsgBoxListActivity",
    "com.tencent.mobileqq.activity.SigCommentListActivity",
    "com.tencent.mobileqq.activity.TroopAssistantActivity",
    "com.tencent.mobileqq.activity.QQLSUnlockActivity",
    "com.tencent.mobileqq.activity.photo.PhotoCropForPortraitActivity",
    "com.tencent.mobileqq.activity.phone.PhoneMatchActivity",
    "com.tencent.mobileqq.activity.photo.PhotoPreviewActivity",
    "com.tencent.mobileqq.activity.DetailProfileActivity",
    "com.tencent.mobileqq.activity.PayBridgeActivity",
    "com.tencent.mobileqq.activity.ForwardRecentActivity",
    "com.tencent.mobileqq.vas.AvatarPendantMarketActivity",
    "com.tencent.mobileqq.activity.TroopMemberListActivity",
    "com.tencent.mobileqq.activity.GesturePWDSettingActivity",
    "com.tencent.mobileqq.troop.activity.TroopAvatarWallPreviewActivity",
    "com.tencent.mobileqq.activity.TroopMemberCardActivity",
    "com.tencent.mobileqq.activity.aio.MessageShareActivity",
    "com.tencent.mobileqq.activity.EditActivity",
    "com.tencent.mobileqq.richstatus.EditActivity",
    "com.tencent.mobileqq.activity.ChatHistory",
    "com.tencent.mobileqq.activity.QQLSActivity",
    "com.tencent.mobileqq.search.activity.GroupSearchActivity",
    "com.tencent.mobileqq.activity.VisitorsActivity",
    "com.tencent.mobileqq.activity.TroopPrivateSettingActivity",
    "com.tencent.mobileqq.activity.ChatSettingForTroop",
    "com.tencent.mobileqq.activity.AccountManageActivity",
    "com.tencent.mobileqq.activity.AddFriendActivity",
    "com.tencent.mobileqq.troop.activity.TroopBarReplyActivity",
    "com.tencent.mobileqq.activity.AutoRemarkActivity",
    "com.tencent.mobileqq.activity.pendant.AvatarPendantActivity",
    "com.tencent.mobileqq.activity.AssistantSettingActivity",
    "com.tencent.mobileqq.activity.contact.troop.ShowExternalTroopListActivity",
    "com.tencent.mobileqq.activity.NearbyBaseActivity",
    "com.tencent.mobileqq.activity.phone.PhoneLaunchActivity",
    "com.tencent.mobileqq.activity.PermisionPrivacyActivity",
    "com.tencent.mobileqq.activity.EditInfoActivity",
    "com.tencent.mobileqq.activity.SubLoginActivity",
    "com.tencent.mobileqq.activity.QQSettingMsgHistoryActivity",
    "com.tencent.mobileqq.activity.aio.photo.AIOGalleryActivity",
    "com.tencent.mobileqq.activity.ChatSettingActivity",
    "com.tencent.mobileqq.activity.GesturePWDUnlockActivity",
    "com.tencent.mobileqq.activity.contact.addcontact.AddContactsActivity",
    "com.tencent.mobileqq.activity.LoginInfoActivity",
    "com.tencent.mobileqq.activity.InstallActivity",
    "com.tencent.mobileqq.activity.PublicAccountListActivity",
    "com.tencent.mobileqq.wxapi.WXEntryActivity",
    "com.tencent.mobileqq.activity.contact.addcontact.ClassificationSearchActivity",
    "com.tencent.mobileqq.qcall.QCallDetailActivity",
    "com.tencent.mobileqq.activity.FriendProfileImageActivity",
    "com.tencent.mobileqq.troop.activity.NearbyTroopsActivity",
    "com.tencent.mobileqq.activity.IndividuationSetActivity",
    "com.tencent.mobileqq.nearby.profilecard.NearbyPeopleProfileActivity",
    "com.tencent.mobileqq.filemanager.activity.UniformDownloadActivity",
    "com.tencent.mobileqq.activity.DiscussionInfoCardActivity",
    "com.tencent.mobileqq.activity.TextPreviewActivity",
    "com.tencent.mobileqq.activity.JumpActivity",
    "com.tencent.mobileqq.activity.QQBrowserActivity",
    "com.tencent.mobileqq.activity.LebaListMgrActivity",
    "com.tencent.mobileqq.activity.SubAccountUgActivity",
    "com.tencent.mobileqq.freshnews.FreshNewsDetailActivity",
    "com.tencent.mobileqq.activity.shortvideo.SendVideoActivity",
    "com.tencent.mobileqq.richstatus.StatusHistoryActivity",
    "com.tencent.mobileqq.activity.SplashActivity",
    "com.tencent.mobileqq.activity.AddRequestActivity",
    "com.tencent.mobileqq.musicgene.MusicGeneQQBrowserActivity",
    "com.tencent.mobileqq.dating.SayHelloMsgListActivity",
    "com.tencent.mobileqq.activity.contact.troop.TroopActivity",
    "com.tencent.mobileqq.activity.contact.addcontact.SearchContactsActivity",
    "com.tencent.mobileqq.activity.NotifyPushSettingActivity",
    "com.tencent.mobileqq.filemanager.activity.fileassistant.QfileFileAssistantActivity",
    "com.tencent.mobileqq.activity.ThemeNoviceGuideActivity",
    "com.tencent.mobileqq.activity.PhoneUnityBindInfoActivity",
    "com.tencent.mobileqq.activity.QQBrowserDelegationActivity",
    "com.tencent.mobileqq.activity.ChatHistoryForC2C",
    "com.tencent.mobileqq.search.activity.ContactSearchComponentActivity",
    "com.tencent.mobileqq.activity.richmedia.FlowCameraPtvActivity2",
    "com.tencent.mobileqq.activity.UpgradeDetailActivity",
    "com.tencent.mobileqq.activity.qwallet.SendHbActivity",
    "com.tencent.mobileqq.activity.NotificationActivity",
    "com.tencent.mobileqq.activity.selectmember.SelectMemberActivity",
    "com.tencent.mobileqq.nearby.picbrowser.NearbyPicBrowserActivity",
    "com.tencent.mobileqq.filemanager.fileviewer.FileBrowserActivity",
    "com.tencent.mobileqq.activity.contact.newfriend.NewFriendActivity",
    "com.tencent.mobileqq.activity.SubAccountMessageActivity",
    "com.tencent.mobileqq.activity.ProfileCardMoreActivity",
    "com.tencent.mobileqq.activity.DevlockQuickLoginActivity",
    "com.tencent.mobileqq.activity.TroopRequestActivity",
    "com.tencent.mobileqq.activity.ChatActivity",
    "com.tencent.mobileqq.troop.activity.TroopAdminList",
    "com.tencent.mobileqq.profile.VipProfileCardPreviewActivity",
    "com.tencent.mobileqq.filemanager.activity.FMActivity",
    "com.tencent.mobileqq.activity.VerifyCodeActivity",
]


def get_all_records():
    sm = leancloud.Query('StatusMap')
    t = TabUtil()
    sm.equal_to('product', 'com.tencent.mobileqqtest')
    sm.ascending('createdAt')
    record_list = t.find_all(sm)
    return record_list


def format_activity(activity):
    return activity.split('##')[0]


def stat_of_records(records):
    activity_list = list(set([format_activity(r.get('pre_activity')) for r in records]))
    core_activity_list = [a for a in activity_list if a in TOP_ACTIVITY]
    acr = len(activity_list) / float(TOTAL_ACTIVITY)
    core_acr = len(core_activity_list) / float(len(TOP_ACTIVITY))
    return dict(
        acr=acr,
        activity_num=TOTAL_ACTIVITY,
        core_acr=core_acr,
        core_activity_num=len(TOP_ACTIVITY)
    )


def stat_status_map():
    record_list = get_all_records()
    record_list.sort(key=lambda x: x.created_at)
    print len(record_list)
    start_time, end_time = record_list[0].created_at, record_list[-1].created_at
    step = datetime.timedelta(seconds=60*5)
    pos = start_time + step

    table = []
    for i, record in enumerate(record_list):
        # print record.created_at
        if record.created_at > pos:
            print 'group: %s' % record.created_at
            group = record_list[0:i]
            stat = stat_of_records(group)
            table.append(dict(
                acr=stat['acr'],
                core_acr=stat['core_acr'],
                activity_num=stat['activity_num'],
                core_activity_num=stat['core_activity_num'],
                start_time=pos-step,
                end_time=pos
            ))
            pos += step
    with open('acr_report.csv', 'wb') as fp:
        w = csv.DictWriter(fp, ['start_time', 'end_time', 'acr', 'core_acr', 'activity_num', 'core_activity_num'])
        w.writeheader()
        w.writerows(table)


if __name__ == "__main__":
    stat_status_map()
