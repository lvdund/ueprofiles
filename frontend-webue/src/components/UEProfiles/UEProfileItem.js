import React from 'react';

function UEProfileItem({ profile, onEdit, onDelete }) {
  return (
    <div style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
      <h3>UE Profile: {profile.supi}</h3>

      {/* Basic Fields */}
      <p>
        <strong>SUPI:</strong> {profile.supi}
      </p>
      <p>
        <strong>SUCI:</strong> {profile.suci}
      </p>

      {/* PlmnId */}
      <div>
        <h4>PLMN ID</h4>
        <p>
          <strong>MCC:</strong> {profile.plmnid?.mcc}
        </p>
        <p>
          <strong>MNC:</strong> {profile.plmnid?.mnc}
        </p>
      </div>

      {/* ConfiguredSlice */}
      <div>
        <h4>Configured Slices</h4>
        {profile.configuredSlice?.map((slice, index) => (
          <div key={index}>
            <p>
              <strong>Slice {index + 1}</strong>
            </p>
            <p>
              <strong>SST:</strong> {slice.sst}
            </p>
            <p>
              <strong>SD:</strong> {slice.sd}
            </p>
          </div>
        ))}
      </div>

      {/* DefaultSlice */}
      <div>
        <h4>Default Slices</h4>
        {profile.defaultSlice?.map((slice, index) => (
          <div key={index}>
            <p>
              <strong>Slice {index + 1}</strong>
            </p>
            <p>
              <strong>SST:</strong> {slice.sst}
            </p>
            <p>
              <strong>SD:</strong> {slice.sd}
            </p>
          </div>
        ))}
      </div>

      {/* Routing Indicator */}
      <p>
        <strong>Routing Indicator:</strong> {profile.routingIndicator}
      </p>

      {/* Home Network Keys */}
      <p>
        <strong>Home Network Private Key:</strong> {profile.homeNetworkPrivateKey}
      </p>
      <p>
        <strong>Home Network Public Key:</strong> {profile.homeNetworkPublicKey}
      </p>
      <p>
        <strong>Home Network Public Key ID:</strong> {profile.homeNetworkPublicKeyId}
      </p>

      {/* Protection Scheme */}
      <p>
        <strong>Protection Scheme:</strong> {profile.protectionScheme}
      </p>

      {/* Key and OP */}
      <p>
        <strong>Key:</strong> {profile.key}
      </p>
      <p>
        <strong>OP:</strong> {profile.op}
      </p>
      <p>
        <strong>OP Type:</strong> {profile.opType}
      </p>

      {/* AMF */}
      <p>
        <strong>AMF:</strong> {profile.amf}
      </p>

      {/* IMEI and IMEISV */}
      <p>
        <strong>IMEI:</strong> {profile.imei}
      </p>
      <p>
        <strong>IMEISV:</strong> {profile.imeisv}
      </p>

      {/* GNB Search List */}
      <div>
        <h4>GNB Search List</h4>
        {profile.gnbSearchList?.map((gnb, index) => (
          <p key={index}>{gnb}</p>
        ))}
      </div>

      {/* Integrity Algorithms */}
      <div>
        <h4>Integrity Algorithms</h4>
        <p>IA1: {profile.integrity?.IA1 ? 'Enabled' : 'Disabled'}</p>
        <p>IA2: {profile.integrity?.IA2 ? 'Enabled' : 'Disabled'}</p>
        <p>IA3: {profile.integrity?.IA3 ? 'Enabled' : 'Disabled'}</p>
      </div>

      {/* Ciphering Algorithms */}
      <div>
        <h4>Ciphering Algorithms</h4>
        <p>EA1: {profile.ciphering?.EA1 ? 'Enabled' : 'Disabled'}</p>
        <p>EA2: {profile.ciphering?.EA2 ? 'Enabled' : 'Disabled'}</p>
        <p>EA3: {profile.ciphering?.EA3 ? 'Enabled' : 'Disabled'}</p>
      </div>

      {/* Profiles */}
      <div>
        <h4>Profiles</h4>
        {profile.profiles?.map((prof, index) => (
          <div key={index}>
            <p>
              <strong>Profile {index + 1}</strong>
            </p>
            <p>
              <strong>Scheme:</strong> {prof.scheme}
            </p>
            <p>
              <strong>Private Key:</strong> {prof.privateKey}
            </p>
            <p>
              <strong>Public Key:</strong> {prof.publicKey}
            </p>
          </div>
        ))}
      </div>

      {/* UAC Access Identities Configuration */}
      <div>
        <h4>UAC Access Identities Configuration</h4>
        <p>MPS: {profile.uacAic?.mps ? 'Enabled' : 'Disabled'}</p>
        <p>MCS: {profile.uacAic?.mcs ? 'Enabled' : 'Disabled'}</p>
      </div>

      {/* UAC Access Control Class */}
      <div>
        <h4>UAC Access Control Class</h4>
        <p>Normal Class: {profile.uacAcc?.normalClass}</p>
        <p>Class11: {profile.uacAcc?.class11 ? 'Enabled' : 'Disabled'}</p>
        <p>Class12: {profile.uacAcc?.class12 ? 'Enabled' : 'Disabled'}</p>
        <p>Class13: {profile.uacAcc?.class13 ? 'Enabled' : 'Disabled'}</p>
        <p>Class14: {profile.uacAcc?.class14 ? 'Enabled' : 'Disabled'}</p>
        <p>Class15: {profile.uacAcc?.class15 ? 'Enabled' : 'Disabled'}</p>
      </div>

      {/* Sessions */}
      <div>
        <h4>Sessions</h4>
        {profile.sessions?.map((session, index) => (
          <div key={index}>
            <p>
              <strong>Session {index + 1}</strong>
            </p>
            <p>
              <strong>Type:</strong> {session.type}
            </p>
            <p>
              <strong>APN:</strong> {session.apn}
            </p>
            {/* Slice within Session */}
            <div>
              <h5>Slice</h5>
              <p>
                <strong>SST:</strong> {session.slice.sst}
              </p>
              <p>
                <strong>SD:</strong> {session.slice.sd}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Integrity Max Rate */}
      <div>
        <h4>Integrity Max Rate</h4>
        <p>Uplink: {profile.integrityMaxRate?.uplink}</p>
        <p>Downlink: {profile.integrityMaxRate?.downlink}</p>
      </div>

      {/* Action Buttons */}
      <button onClick={() => onEdit(profile)}>Edit</button>
      <button onClick={() => onDelete(profile.supi)}>Delete</button>
    </div>
  );
}

export default UEProfileItem;
