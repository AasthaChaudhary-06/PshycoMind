import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectUser } from '../features/auth/authSelectors'
import { showNotification } from '../features/notification/notificationSlice'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ROLES } from '../constants'

export default function SettingsPage() {
  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('pref:notifications', true)
  const [emailDigest, setEmailDigest] = useLocalStorage('pref:emailDigest', false)
  const [language, setLanguage] = useLocalStorage('pref:language', 'en')

  const toggle = (enabled, setter, label) => {
    setter(!enabled)
    dispatch(showNotification({ type: 'success', message: `${label} updated` }))
  }

  const preferenceRows = [
    {
      label: 'Notifications',
      description: 'Get notified about quiz results and study reminders',
      checked: notificationsEnabled,
      onChange: () => toggle(notificationsEnabled, setNotificationsEnabled, 'Notifications'),
    },
    {
      label: 'Email Digest',
      description: 'Receive a weekly summary of your study progress',
      checked: emailDigest,
      onChange: () => toggle(emailDigest, setEmailDigest, 'Email digest'),
    },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="card divide-y divide-gray-200 dark:divide-gray-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="font-medium">Account</p>
            <p className="text-sm text-gray-500">
              {user?.name} · {user?.role === ROLES.STUDENT ? 'Student' : 'Faculty'}
            </p>
          </div>
          <span className="badge bg-emerald-100 text-emerald-700">Active</span>
        </div>

        {preferenceRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="font-medium">{row.label}</p>
              <p className="text-sm text-gray-500">{row.description}</p>
            </div>
            <button
              role="switch"
              aria-checked={row.checked}
              onClick={row.onChange}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                row.checked ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  row.checked ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        ))}

        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="font-medium">Language</p>
            <p className="text-sm text-gray-500">Interface language</p>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="input w-auto"
          >
            <option value="en">English</option>
            <option value="ta">தமிழ்</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
      </div>
    </div>
  )
}
