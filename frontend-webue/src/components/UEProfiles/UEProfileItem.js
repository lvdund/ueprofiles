import React, { useState } from 'react';
import UEProfileForm from './UEProfileForm';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import PropTypes from 'prop-types';
import { Button, ListGroup, Badge, Row, Col, Collapse, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';

function UEProfileItem({ profile, onDelete, refreshProfiles }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [open, setOpen] = useState(false); // For collapsing details

  const handleEdit = () => {
    setIsEditing(true);
    setOpen(true); // Automatically open details for editing
  };

  const handleFormClose = () => {
    setIsEditing(false);
  };

  const handleFormSubmit = async () => {
    try {
      await refreshProfiles();
      setIsEditing(false);
      toast.success('UE Profile updated successfully.');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating UE Profile.');
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    onDelete(profile.supi);
    setShowDeleteModal(false);
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
  };
  console.log('UE Profile Data:', profile);

  return (
    <>
      <ListGroup.Item className="mb-3 p-3 shadow-sm">
        <Row>
          <Col md={8} onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}>
            <h5>UE Profile: {profile.supi}</h5>
          </Col>
          <Col md={4} className="text-end">
            <Button variant="outline-primary" size="sm" onClick={handleEdit} className="me-2">
              Edit
            </Button>
            <Button variant="outline-danger" size="sm" onClick={handleDeleteClick}>
              Delete
            </Button>
          </Col>
        </Row>
        <Collapse in={open}>
          <div>
            <ListGroup variant="flush" className="mt-3">
              {/* ID và UserID */}
              <ListGroup.Item>
                <strong>ID:</strong> {profile.id || 'N/A'}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>UserID:</strong> {profile.userId || 'N/A'}
              </ListGroup.Item>

              {/* SUCI */}
              <ListGroup.Item>
                <strong>SUCI:</strong> {profile.suci || 'N/A'}
              </ListGroup.Item>

              {/* PLMN ID */}
              <ListGroup.Item>
                <strong>PLMN ID:</strong> MCC: {profile.plmnid?.mcc || 'N/A'}, MNC: {profile.plmnid?.mnc || 'N/A'}
              </ListGroup.Item>

              {/* Configured Slices */}
              <ListGroup.Item>
                <strong>Configured Slices:</strong>
                <div className="mt-2">
                  {profile.ueconfiguredNssai && profile.ueconfiguredNssai.length > 0 ? (
                    profile.ueconfiguredNssai.map((slice, index) => (
                      <Badge bg="secondary" key={index} className="me-1">
                        SST: {slice.sst}, SD: {slice.sd}
                      </Badge>
                    ))
                  ) : (
                    'N/A'
                  )}
                </div>
              </ListGroup.Item>

              {/* Default Slices */}
              <ListGroup.Item>
                <strong>Default Slices:</strong>
                <div className="mt-2">
                  {profile.uedefaultNssai && profile.uedefaultNssai.length > 0 ? (
                    profile.uedefaultNssai.map((slice, index) => (
                      <Badge bg="info" key={index} className="me-1">
                        SST: {slice.sst}, SD: {slice.sd}
                      </Badge>
                    ))
                  ) : (
                    'N/A'
                  )}
                </div>
              </ListGroup.Item>

              {/* Routing Indicator */}
              <ListGroup.Item>
                <strong>Routing Indicator:</strong> {profile.routingIndicator || 'N/A'}
              </ListGroup.Item>

              {/* Home Network Keys */}
              <ListGroup.Item>
                <strong>Home Network Private Key:</strong> {profile.homeNetworkPrivateKey || 'N/A'}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Home Network Public Key:</strong> {profile.homeNetworkPublicKey || 'N/A'}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Home Network Public Key ID:</strong> {profile.homeNetworkPublicKeyId || 'N/A'}
              </ListGroup.Item>

              {/* Protection Scheme */}
              <ListGroup.Item>
                <strong>Protection Scheme:</strong> {profile.protectionScheme || 'N/A'}
              </ListGroup.Item>

              {/* Key và KeyPair */}
              <ListGroup.Item>
                <strong>Key:</strong> {profile.key || 'N/A'}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>KeyPair:</strong> {profile.keypair || 'N/A'}
              </ListGroup.Item>

              {/* OP và OP Type */}
              <ListGroup.Item>
                <strong>OP:</strong> {profile.op || 'N/A'}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>OP Type:</strong> {profile.opType || 'N/A'}
              </ListGroup.Item>

              {/* AMF */}
              <ListGroup.Item>
                <strong>AMF:</strong> {profile.amf || 'N/A'}
              </ListGroup.Item>

              {/* IMEI và IMEISV */}
              <ListGroup.Item>
                <strong>IMEI:</strong> {profile.imei || 'N/A'}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>IMEISV:</strong> {profile.imeisv || 'N/A'}
              </ListGroup.Item>

              {/* GNB Search List */}
              <ListGroup.Item>
                <strong>GNB Search List:</strong>
                <div className="mt-2">
                  {profile.gnbSearchList?.map((gnb, index) => (
                    <Badge bg="warning" key={index} className="me-1">
                      {gnb}
                    </Badge>
                  )) || 'N/A'}
                </div>
              </ListGroup.Item>

              {/* Sessions */}
              <ListGroup.Item>
                <strong>Sessions:</strong>
                <div className="mt-2">
                  {profile.sessions?.map((session, index) => (
                    <Card key={index} className="mb-2">
                      <Card.Body>
                        <strong>Session {index + 1}:</strong>
                        <div><strong>Type:</strong> {session.type || 'N/A'}</div>
                        <div><strong>APN:</strong> {session.apn || 'N/A'}</div>
                        <div>
                          <strong>Slice:</strong> SST: {session.slice?.sst || 'N/A'}, SD: {session.slice?.sd || 'N/A'}
                        </div>
                      </Card.Body>
                    </Card>
                  )) || 'N/A'}
                </div>
              </ListGroup.Item>

              {/* Integrity Max Rate */}
              <ListGroup.Item>
                <strong>Integrity Max Rate:</strong>
                <div className="mt-2">
                  <div><strong>Uplink:</strong> {profile.integrityMaxRate?.uplink || 'N/A'}</div>
                  <div><strong>Downlink:</strong> {profile.integrityMaxRate?.downlink || 'N/A'}</div>
                </div>
              </ListGroup.Item>

              {/* Integrity */}
              <ListGroup.Item>
                <strong>Integrity:</strong>
                <div className="mt-2">
                  {['IA1', 'IA2', 'IA3'].map((alg) => (
                    <Badge
                      bg={profile.integrity[alg] ? 'success' : 'danger'}
                      key={alg}
                      className="me-1"
                    >
                      {alg}
                    </Badge>
                  )) || 'N/A'}
                </div>
              </ListGroup.Item>

              {/* Ciphering */}
              <ListGroup.Item>
                <strong>Ciphering:</strong>
                <div className="mt-2">
                  {['EA1', 'EA2', 'EA3'].map((alg) => (
                    <Badge
                      bg={profile.ciphering[alg] ? 'success' : 'danger'}
                      key={alg}
                      className="me-1"
                    >
                      {alg}
                    </Badge>
                  )) || 'N/A'}
                </div>
              </ListGroup.Item>

              {/* UAC Access Identities Configuration */}
              <ListGroup.Item>
                <strong>UAC Access Identities Configuration:</strong>
                <div className="mt-2">
                  {['mps', 'mcs'].map((field) => (
                    <Badge
                      bg={profile.uacAic[field] ? 'success' : 'danger'}
                      key={field}
                      className="me-1"
                    >
                      {field.toUpperCase()}
                    </Badge>
                  )) || 'N/A'}
                </div>
              </ListGroup.Item>

              {/* UAC Access Control Class */}
              <ListGroup.Item>
                <strong>UAC Access Control Class:</strong> Normal Class: {profile.uacAcc.normalClass || 'N/A'}
                <div className="mt-2">
                  {['class11', 'class12', 'class13', 'class14', 'class15'].map((cls) => (
                    <Badge
                      bg={profile.uacAcc[cls] ? 'success' : 'danger'}
                      key={cls}
                      className="me-1"
                    >
                      {cls.toUpperCase()}
                    </Badge>
                  )) || 'N/A'}
                </div>
              </ListGroup.Item>
            </ListGroup>
          </div>
        </Collapse>
      </ListGroup.Item>

      {/* Edit Form */}
      {isEditing && (
        <UEProfileForm
          selectedProfile={profile}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        handleClose={handleCloseModal}
        handleConfirm={handleConfirmDelete}
        supi={profile.supi}
      />
    </>
  );
}

UEProfileItem.propTypes = {
  profile: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
  refreshProfiles: PropTypes.func.isRequired,
};

export default UEProfileItem;
