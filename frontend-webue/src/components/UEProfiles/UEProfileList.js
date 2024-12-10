import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../api';
import { getToken } from '../../utils/auth';
import UEProfileItem from './UEProfileItem';
import UEProfileForm from './UEProfileForm';

function UEProfileList() {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [editingProfile, setEditingProfile] = useState(null);
  const [searchSUPI, setSearchSUPI] = useState('');
  const [token] = useState(getToken());

  // **1. Memoize fetchProfiles using useCallback**
  const fetchProfiles = useCallback(async () => {
    try {
      const response = await axios.get('/ue_profiles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      // Assume profiles are sorted by creation time descending
      setProfiles(Array.isArray(data) ? data : []);
      setFilteredProfiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching profiles', error);
      setProfiles([]);
      setFilteredProfiles([]);
    }
  }, [token]);

  // **2. Include fetchProfiles in useEffect dependencies**
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleEdit = (profile) => {
    setEditingProfile(profile);
  };

  const handleDelete = async (supi) => {
    if (window.confirm('Are you sure you want to delete this UE Profile?')) {
      try {
        await axios.delete(`/ue_profiles/${supi}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchProfiles();
      } catch (error) {
        console.error('Error deleting profile', error);
      }
    }
  };

  const handleGenerate = async () => {
    const numUes = prompt('Enter the number of UE profiles to generate:', '1');
    if (numUes && !isNaN(numUes)) {
      try {
        await axios.post(
          '/ue_profiles/generate',
          { num_ues: parseInt(numUes, 10) },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        fetchProfiles();
      } catch (error) {
        console.error('Error generating profiles', error);
      }
    } else {
      alert('Please enter a valid number.');
    }
  };

  const handleSearchChange = (e) => {
    const supi = e.target.value;
    setSearchSUPI(supi);
    if (supi === '') {
      // If search is empty, show all profiles
      setFilteredProfiles(profiles);
    } else {
      // Filter profiles by SUPI
      const filtered = profiles.filter((profile) =>
        profile.supi.toLowerCase().includes(supi.toLowerCase())
      );
      setFilteredProfiles(filtered);
    }
  };

  const handleCreate = () => {
    // Reset editingProfile to an empty object to create a new profile
    setEditingProfile({});
  };

  const handleFormClose = () => {
    setEditingProfile(null);
  };

  // Function to group profiles by creation date
  const groupProfilesByDate = (profilesList) => {
    const grouped = profilesList.reduce((groups, profile) => {
      let date = 'Unknown Date';
      if (profile.createdAt) {
        const parsedDate = new Date(profile.createdAt);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate.toLocaleDateString();
        }
      }
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(profile);
      return groups;
    }, {});
    return grouped;
  };

  // Get grouped profiles
  const groupedProfiles = groupProfilesByDate(filteredProfiles);

  return (
    <div>
      <h2>Your UE Profiles</h2>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={handleGenerate}>Generate UE Profile(s)</button>
        <button onClick={handleCreate}>Create UE Profile</button>
        <input
          type="text"
          placeholder="Search by SUPI"
          value={searchSUPI}
          onChange={handleSearchChange}
          style={{ marginLeft: '10px' }}
        />
      </div>
      {editingProfile && (
        <UEProfileForm
          selectedProfile={editingProfile}
          refreshProfiles={fetchProfiles}
          setEditing={handleFormClose}
        />
      )}
      {filteredProfiles && filteredProfiles.length > 0 ? (
        Object.keys(groupedProfiles).map((date) => (
          <div key={date}>
            <h3>{date}</h3>
            {groupedProfiles[date].map((profile) => (
              <UEProfileItem
                key={profile.supi}
                profile={profile}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ))
      ) : (
        <p>No UE Profiles found.</p>
      )}
    </div>
  );
}

export default UEProfileList;
