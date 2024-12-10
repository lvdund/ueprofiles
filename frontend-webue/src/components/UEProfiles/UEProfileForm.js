import React, { useState, useEffect } from 'react';
import axios from '../../api';
import { getToken } from '../../utils/auth';

function UEProfileForm({ selectedProfile, refreshProfiles, setEditing }) {

  const getDefaultFormData = () => ({
    supi: '',
    suci: '',
    plmnid: { mcc: '', mnc: '' },
    configuredSlice: [],
    defaultSlice: [],
    routingIndicator: '',
    homeNetworkPrivateKey: '',
    homeNetworkPublicKey: '',
    homeNetworkPublicKeyId: 0,
    protectionScheme: 0,
    key: '',
    op: '',
    opType: '',
    amf: '',
    imei: '',
    imeiSv: '',
    gnbSearchList: [],
    integrity: { IA1: false, IA2: false, IA3: false },
    ciphering: { EA1: false, EA2: false, EA3: false },
    profiles: [],
    uacAic: { mps: false, mcs: false },
    uacAcc: {
      normalClass: 0,
      class11: false,
      class12: false,
      class13: false,
      class14: false,
      class15: false,
    },
    sessions: [],
    integrityMaxRate: { uplink: '', downlink: '' },
  });

  const [formData, setFormData] = useState(
    selectedProfile && Object.keys(selectedProfile).length > 0
      ? selectedProfile
      : getDefaultFormData()
  );
  
  useEffect(() => {
    setFormData(
      selectedProfile && Object.keys(selectedProfile).length > 0
        ? selectedProfile
        : getDefaultFormData()
    );
  }, [selectedProfile]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Handle nested fields
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData((prevData) => {
        const updatedData = { ...prevData };
        let current = updatedData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return updatedData;
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    // Handle nested fields
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData((prevData) => {
        const updatedData = { ...prevData };
        let current = updatedData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = checked;
        return updatedData;
      });
    } else {
      setFormData({
        ...formData,
        [name]: checked,
      });
    }
  };

  const handleArrayChange = (fieldName, index, subFieldName, value) => {
    setFormData((prevData) => {
      const updatedArray = [...prevData[fieldName]];
      updatedArray[index] = {
        ...updatedArray[index],
        [subFieldName]: value,
      };
      return {
        ...prevData,
        [fieldName]: updatedArray,
      };
    });
  };

  const addArrayItem = (fieldName, defaultItem) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: [...prevData[fieldName], defaultItem],
    }));
  };

  const removeArrayItem = (fieldName, index) => {
    setFormData((prevData) => {
      const updatedArray = [...prevData[fieldName]];
      updatedArray.splice(index, 1);
      return {
        ...prevData,
        [fieldName]: updatedArray,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    try {
      if (selectedProfile) {
        // Update existing profile
        await axios.put(`/ue_profiles/${selectedProfile.supi}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEditing(false);
      } else {
        // Create new profile
        await axios.post('/ue_profiles', [formData], {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      refreshProfiles();
    } catch (error) {
      console.error('Error saving profile', error);
    }
  };

  return (
    <div>
      <h3>{selectedProfile ? 'Edit UE Profile' : 'Create UE Profile'}</h3>
      <form onSubmit={handleSubmit}>
        {/* SUPI */}
        <div>
          <label>SUPI:</label>
          <input
            type="text"
            name="supi"
            value={formData.supi || ''}
            onChange={handleChange}
            required={!selectedProfile}
            disabled={!!selectedProfile}
          />
        </div>

        {/* SUCI */}
        <div>
          <label>SUCI:</label>
          <input
            type="text"
            name="suci"
            value={formData.suci || ''}
            onChange={handleChange}
          />
        </div>

        {/* PlmnId */}
        <div>
          <h4>PLMN ID</h4>
          <div>
            <label>MCC:</label>
            <input
              type="text"
              name="plmnid.mcc"
              value={formData.plmnid?.mcc || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>MNC:</label>
            <input
              type="text"
              name="plmnid.mnc"
              value={formData.plmnid?.mnc || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ConfiguredSlice */}
        <div>
          <h4>Configured Slices</h4>
          {formData.configuredSlice.map((slice, index) => (
            <div key={index}>
              <h5>Slice {index + 1}</h5>
              <div>
                <label>SST:</label>
                <input
                  type="number"
                  value={slice.sst}
                  onChange={(e) =>
                    handleArrayChange(
                      'configuredSlice',
                      index,
                      'sst',
                      parseInt(e.target.value, 10)
                    )
                  }
                />
              </div>
              <div>
                <label>SD:</label>
                <input
                  type="text"
                  value={slice.sd}
                  onChange={(e) =>
                    handleArrayChange('configuredSlice', index, 'sd', e.target.value)
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => removeArrayItem('configuredSlice', index)}
              >
                Remove Slice
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              addArrayItem('configuredSlice', {
                sst: 0,
                sd: '',
              })
            }
          >
            Add Slice
          </button>
        </div>

        {/* Similar blocks for DefaultSlice, Profiles, Sessions, GnbSearchList */}

        {/* Routing Indicator */}
        <div>
          <label>Routing Indicator:</label>
          <input
            type="text"
            name="routingIndicator"
            value={formData.routingIndicator || ''}
            onChange={handleChange}
          />
        </div>

        {/* Home Network Private Key */}
        <div>
          <label>Home Network Private Key:</label>
          <input
            type="text"
            name="homeNetworkPrivateKey"
            value={formData.homeNetworkPrivateKey || ''}
            onChange={handleChange}
          />
        </div>

        {/* Home Network Public Key */}
        <div>
          <label>Home Network Public Key:</label>
          <input
            type="text"
            name="homeNetworkPublicKey"
            value={formData.homeNetworkPublicKey || ''}
            onChange={handleChange}
          />
        </div>

        {/* Home Network Public Key ID */}
        <div>
          <label>Home Network Public Key ID:</label>
          <input
            type="number"
            name="homeNetworkPublicKeyId"
            value={formData.homeNetworkPublicKeyId || 0}
            onChange={handleChange}
          />
        </div>

        {/* Protection Scheme */}
        <div>
          <label>Protection Scheme:</label>
          <input
            type="number"
            name="protectionScheme"
            value={formData.protectionScheme || 0}
            onChange={handleChange}
          />
        </div>

        {/* Key */}
        <div>
          <label>Key:</label>
          <input
            type="text"
            name="key"
            value={formData.key || ''}
            onChange={handleChange}
          />
        </div>

        {/* OP */}
        <div>
          <label>OP:</label>
          <input
            type="text"
            name="op"
            value={formData.op || ''}
            onChange={handleChange}
          />
        </div>

        {/* OP Type */}
        <div>
          <label>OP Type:</label>
          <select name="opType" value={formData.opType || ''} onChange={handleChange}>
            <option value="">Select</option>
            <option value="OP">OP</option>
            <option value="OPC">OPC</option>
          </select>
        </div>

        {/* AMF */}
        <div>
          <label>AMF:</label>
          <input
            type="text"
            name="amf"
            value={formData.amf || ''}
            onChange={handleChange}
          />
        </div>

        {/* IMEI */}
        <div>
          <label>IMEI:</label>
          <input
            type="text"
            name="imei"
            value={formData.imei || ''}
            onChange={handleChange}
          />
        </div>

        {/* IMEISV */}
        <div>
          <label>IMEISV:</label>
          <input
            type="text"
            name="imeisv"
            value={formData.imeisv || ''}
            onChange={handleChange}
          />
        </div>

        {/* GNB Search List */}
        <div>
          <h4>GNB Search List</h4>
          {formData.gnbSearchList.map((gnb, index) => (
            <div key={index}>
              <input
                type="text"
                value={gnb}
                onChange={(e) =>
                  handleArrayChange('gnbSearchList', index, null, e.target.value)
                }
              />
              <button
                type="button"
                onClick={() => removeArrayItem('gnbSearchList', index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('gnbSearchList', '')}
          >
            Add GNB
          </button>
        </div>

        {/* Integrity */}
        <div>
          <h4>Integrity Algorithms</h4>
          <div>
            <label>
              <input
                type="checkbox"
                name="integrity.IA1"
                checked={formData.integrity?.IA1 || false}
                onChange={handleCheckboxChange}
              />
              IA1
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="integrity.IA2"
                checked={formData.integrity?.IA2 || false}
                onChange={handleCheckboxChange}
              />
              IA2
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="integrity.IA3"
                checked={formData.integrity?.IA3 || false}
                onChange={handleCheckboxChange}
              />
              IA3
            </label>
          </div>
        </div>

        {/* Ciphering */}
        <div>
          <h4>Ciphering Algorithms</h4>
          <div>
            <label>
              <input
                type="checkbox"
                name="ciphering.EA1"
                checked={formData.ciphering?.EA1 || false}
                onChange={handleCheckboxChange}
              />
              EA1
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="ciphering.EA2"
                checked={formData.ciphering?.EA2 || false}
                onChange={handleCheckboxChange}
              />
              EA2
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="ciphering.EA3"
                checked={formData.ciphering?.EA3 || false}
                onChange={handleCheckboxChange}
              />
              EA3
            </label>
          </div>
        </div>

        {/* Profiles */}
        <div>
          <h4>Profiles</h4>
          {formData.profiles.map((profile, index) => (
            <div key={index}>
              <h5>Profile {index + 1}</h5>
              <div>
                <label>Scheme:</label>
                <input
                  type="number"
                  value={profile.scheme}
                  onChange={(e) =>
                    handleArrayChange(
                      'profiles',
                      index,
                      'scheme',
                      parseInt(e.target.value, 10)
                    )
                  }
                />
              </div>
              <div>
                <label>Private Key:</label>
                <input
                  type="text"
                  value={profile.privateKey}
                  onChange={(e) =>
                    handleArrayChange('profiles', index, 'privateKey', e.target.value)
                  }
                />
              </div>
              <div>
                <label>Public Key:</label>
                <input
                  type="text"
                  value={profile.publicKey}
                  onChange={(e) =>
                    handleArrayChange('profiles', index, 'publicKey', e.target.value)
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => removeArrayItem('profiles', index)}
              >
                Remove Profile
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              addArrayItem('profiles', {
                scheme: 0,
                privateKey: '',
                publicKey: '',
              })
            }
          >
            Add Profile
          </button>
        </div>

        {/* UAC Access Identities Configuration (UacAic) */}
        <div>
          <h4>UAC Access Identities Configuration</h4>
          <div>
            <label>
              <input
                type="checkbox"
                name="uacAic.mps"
                checked={formData.uacAic?.mps || false}
                onChange={handleCheckboxChange}
              />
              MPS
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="uacAic.mcs"
                checked={formData.uacAic?.mcs || false}
                onChange={handleCheckboxChange}
              />
              MCS
            </label>
          </div>
        </div>

        {/* UAC Access Control Class (UacAcc) */}
        <div>
          <h4>UAC Access Control Class</h4>
          <div>
            <label>Normal Class:</label>
            <input
              type="number"
              name="uacAcc.normalClass"
              value={formData.uacAcc?.normalClass || 0}
              onChange={handleChange}
            />
          </div>
          {['class11', 'class12', 'class13', 'class14', 'class15'].map((cls) => (
            <div key={cls}>
              <label>
                <input
                  type="checkbox"
                  name={`uacAcc.${cls}`}
                  checked={formData.uacAcc?.[cls] || false}
                  onChange={handleCheckboxChange}
                />
                {cls}
              </label>
            </div>
          ))}
        </div>

        {/* Sessions */}
        <div>
          <h4>Sessions</h4>
          {formData.sessions.map((session, index) => (
            <div key={index}>
              <h5>Session {index + 1}</h5>
              <div>
                <label>Type:</label>
                <input
                  type="text"
                  value={session.type}
                  onChange={(e) =>
                    handleArrayChange('sessions', index, 'type', e.target.value)
                  }
                />
              </div>
              <div>
                <label>APN:</label>
                <input
                  type="text"
                  value={session.apn}
                  onChange={(e) =>
                    handleArrayChange('sessions', index, 'apn', e.target.value)
                  }
                />
              </div>
              {/* Slice within Session */}
              <div>
                <h5>Slice</h5>
                <div>
                  <label>SST:</label>
                  <input
                    type="number"
                    value={session.slice.sst}
                    onChange={(e) =>
                      setFormData((prevData) => {
                        const updatedSessions = [...prevData.sessions];
                        updatedSessions[index].slice.sst = parseInt(e.target.value, 10);
                        return { ...prevData, sessions: updatedSessions };
                      })
                    }
                  />
                </div>
                <div>
                  <label>SD:</label>
                  <input
                    type="text"
                    value={session.slice.sd}
                    onChange={(e) =>
                      setFormData((prevData) => {
                        const updatedSessions = [...prevData.sessions];
                        updatedSessions[index].slice.sd = e.target.value;
                        return { ...prevData, sessions: updatedSessions };
                      })
                    }
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeArrayItem('sessions', index)}
              >
                Remove Session
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              addArrayItem('sessions', {
                type: '',
                apn: '',
                slice: { sst: 0, sd: '' },
              })
            }
          >
            Add Session
          </button>
        </div>

        {/* Integrity Max Rate */}
        <div>
          <h4>Integrity Max Rate</h4>
          <div>
            <label>Uplink:</label>
            <input
              type="text"
              name="integrityMaxRate.uplink"
              value={formData.integrityMaxRate?.uplink || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Downlink:</label>
            <input
              type="text"
              name="integrityMaxRate.downlink"
              value={formData.integrityMaxRate?.downlink || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit">{selectedProfile ? 'Update' : 'Create'}</button>
        {selectedProfile && (
          <button type="button" onClick={() => setEditing(false)}>
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}

export default UEProfileForm;
