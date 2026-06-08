'use client';

import React, { useState } from 'react';
import { ThemeButton } from '@/lib/theme/ThemeButton';
import {
  SewingPinIcon,
  ClockIcon,
  HomeIcon,
  PlusIcon,
  BackpackIcon,
  RocketIcon,
  ReaderIcon,
  PersonIcon,
} from '@radix-ui/react-icons';

interface Routine {
  id: string;
  type: 'work' | 'home' | 'exercise' | 'learning' | 'social' | 'other';
  title: string;
  description: string;
  time: string;
  location?: string;
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
}

interface UserProfile {
  name: string;
  occupation: string;
  location: string;
  workAddress: string;
  homeAddress: string;
  wakeUpTime: string;
  bedTime: string;
  routines: Routine[];
}

const defaultProfile: UserProfile = {
  name: 'John Doe',
  occupation: 'Software Developer',
  location: 'San Francisco, CA',
  workAddress: '123 Tech Street, San Francisco, CA',
  homeAddress: '456 Home Avenue, San Francisco, CA',
  wakeUpTime: '07:00',
  bedTime: '23:00',
  routines: [
    {
      id: '1',
      type: 'work',
      title: 'Morning Commute',
      description: 'Drive to work via Highway 101',
      time: '08:30',
      location: 'Home to Office',
      frequency: 'weekdays',
    },
    {
      id: '2',
      type: 'exercise',
      title: 'Gym Session',
      description: 'Evening workout at local gym',
      time: '18:00',
      location: 'Fitness Center',
      frequency: 'weekdays',
    },
    {
      id: '3',
      type: 'learning',
      title: 'Online Course',
      description: 'React/Next.js learning session',
      time: '20:00',
      location: 'Home Office',
      frequency: 'daily',
    },
  ],
};

export function KnowMeProfile() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'routines'>('profile');

  const routineIcons = {
    work: BackpackIcon,
    home: HomeIcon,
    exercise: RocketIcon,
    learning: ReaderIcon,
    social: PersonIcon,
    other: ClockIcon,
  };

  const handleProfileUpdate = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const addRoutine = () => {
    const newRoutine: Routine = {
      id: Date.now().toString(),
      type: 'other',
      title: 'New Routine',
      description: '',
      time: '09:00',
      frequency: 'daily',
    };
    setProfile((prev) => ({
      ...prev,
      routines: [...prev.routines, newRoutine],
    }));
  };

  const updateRoutine = (id: string, updates: Partial<Routine>) => {
    setProfile((prev) => ({
      ...prev,
      routines: prev.routines.map((routine) =>
        routine.id === id ? { ...routine, ...updates } : routine,
      ),
    }));
  };

  const deleteRoutine = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      routines: prev.routines.filter((routine) => routine.id !== id),
    }));
  };

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow'>
        {/* Header */}
        <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                Know Me Profile
              </h2>
              <p className='text-gray-600 dark:text-gray-400 mt-1'>
                Help AI understand your routines for smarter reminders
              </p>
            </div>
            <ThemeButton
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? 'secondary' : 'primary'}
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </ThemeButton>
          </div>
        </div>

        {/* Tabs */}
        <div className='border-b border-gray-200 dark:border-gray-700'>
          <nav className='flex'>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'profile'
                  ? 'border-deep_sky_blue-500 text-deep_sky_blue-600 dark:text-deep_sky_blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Basic Profile
            </button>
            <button
              onClick={() => setActiveTab('routines')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'routines'
                  ? 'border-deep_sky_blue-500 text-deep_sky_blue-600 dark:text-deep_sky_blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Daily Routines
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className='p-6'>
          {activeTab === 'profile' && (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type='text'
                      value={profile.name}
                      onChange={(e) =>
                        handleProfileUpdate('name', e.target.value)
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-deep_sky_blue-500 focus:border-deep_sky_blue-500 dark:bg-gray-700 dark:text-white'
                    />
                  ) : (
                    <p className='text-gray-900 dark:text-white'>
                      {profile.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Occupation
                  </label>
                  {isEditing ? (
                    <input
                      type='text'
                      value={profile.occupation}
                      onChange={(e) =>
                        handleProfileUpdate('occupation', e.target.value)
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-deep_sky_blue-500 focus:border-deep_sky_blue-500 dark:bg-gray-700 dark:text-white'
                    />
                  ) : (
                    <p className='text-gray-900 dark:text-white'>
                      {profile.occupation}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type='text'
                      value={profile.location}
                      onChange={(e) =>
                        handleProfileUpdate('location', e.target.value)
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-deep_sky_blue-500 focus:border-deep_sky_blue-500 dark:bg-gray-700 dark:text-white'
                    />
                  ) : (
                    <p className='text-gray-900 dark:text-white flex items-center'>
                      <SewingPinIcon className='h-4 w-4 mr-2' />
                      {profile.location}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Wake Up Time
                  </label>
                  {isEditing ? (
                    <input
                      type='time'
                      value={profile.wakeUpTime}
                      onChange={(e) =>
                        handleProfileUpdate('wakeUpTime', e.target.value)
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-deep_sky_blue-500 focus:border-deep_sky_blue-500 dark:bg-gray-700 dark:text-white'
                    />
                  ) : (
                    <p className='text-gray-900 dark:text-white flex items-center'>
                      <ClockIcon className='h-4 w-4 mr-2' />
                      {profile.wakeUpTime}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Work Address
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    value={profile.workAddress}
                    onChange={(e) =>
                      handleProfileUpdate('workAddress', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-deep_sky_blue-500 focus:border-deep_sky_blue-500 dark:bg-gray-700 dark:text-white'
                  />
                ) : (
                  <p className='text-gray-900 dark:text-white flex items-center'>
                    <BackpackIcon className='h-4 w-4 mr-2' />
                    {profile.workAddress}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Home Address
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    value={profile.homeAddress}
                    onChange={(e) =>
                      handleProfileUpdate('homeAddress', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-deep_sky_blue-500 focus:border-deep_sky_blue-500 dark:bg-gray-700 dark:text-white'
                  />
                ) : (
                  <p className='text-gray-900 dark:text-white flex items-center'>
                    <HomeIcon className='h-4 w-4 mr-2' />
                    {profile.homeAddress}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'routines' && (
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                  Daily Routines
                </h3>
                {isEditing && (
                  <ThemeButton onClick={addRoutine} variant='success' size='sm'>
                    Add Routine
                  </ThemeButton>
                )}
              </div>

              <div className='space-y-4'>
                {profile.routines.map((routine) => {
                  const Icon = routineIcons[routine.type];
                  return (
                    <div
                      key={routine.id}
                      className='border border-gray-200 dark:border-gray-700 rounded-lg p-4'
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex items-start space-x-3'>
                          <div className='flex-shrink-0'>
                            <div className='w-10 h-10 bg-deep_sky_blue-100 dark:bg-deep_sky_blue-900 rounded-lg flex items-center justify-center'>
                              <Icon className='h-5 w-5 text-deep_sky_blue-600 dark:text-deep_sky_blue-400' />
                            </div>
                          </div>
                          <div className='flex-1'>
                            {isEditing ? (
                              <div className='space-y-2'>
                                <input
                                  type='text'
                                  value={routine.title}
                                  onChange={(e) =>
                                    updateRoutine(routine.id, {
                                      title: e.target.value,
                                    })
                                  }
                                  className='w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white'
                                />
                                <textarea
                                  value={routine.description}
                                  onChange={(e) =>
                                    updateRoutine(routine.id, {
                                      description: e.target.value,
                                    })
                                  }
                                  className='w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white'
                                  rows={2}
                                />
                                <div className='flex space-x-2'>
                                  <input
                                    type='time'
                                    value={routine.time}
                                    onChange={(e) =>
                                      updateRoutine(routine.id, {
                                        time: e.target.value,
                                      })
                                    }
                                    className='px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white'
                                  />
                                  <select
                                    value={routine.frequency}
                                    onChange={(e) =>
                                      updateRoutine(routine.id, {
                                        frequency: e.target
                                          .value as Routine['frequency'],
                                      })
                                    }
                                    className='px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white'
                                  >
                                    <option value='daily'>Daily</option>
                                    <option value='weekdays'>Weekdays</option>
                                    <option value='weekends'>Weekends</option>
                                    <option value='custom'>Custom</option>
                                  </select>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <h4 className='text-sm font-medium text-gray-900 dark:text-white'>
                                  {routine.title}
                                </h4>
                                <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                                  {routine.description}
                                </p>
                                <div className='flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400'>
                                  <ClockIcon className='h-3 w-3 mr-1' />
                                  {routine.time} • {routine.frequency}
                                  {routine.location && (
                                    <>
                                      <SewingPinIcon className='h-3 w-3 ml-3 mr-1' />
                                      {routine.location}
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {isEditing && (
                          <ThemeButton
                            onClick={() => deleteRoutine(routine.id)}
                            variant='error'
                            size='sm'
                          >
                            Remove
                          </ThemeButton>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

