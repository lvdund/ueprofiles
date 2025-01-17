import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../api';
import UEProfileItem from './UEProfileItem';
import { getToken } from '../../utils/auth';
import GenerateUEProfileForm from './GenerateUEProfileForm';
import { toast } from 'react-toastify';
import { Button, InputGroup, FormControl, Row, Col, Card } from 'react-bootstrap';

function UEProfileList() {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [searchSUPI, setSearchSUPI] = useState('');
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const token = getToken();

  // Hàm lấy danh sách UE Profiles
  const fetchProfiles = useCallback(async () => {
    try {
      const response = await axios.get('/ue_profiles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      setProfiles(Array.isArray(data) ? data : []);
      setFilteredProfiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setProfiles([]);
      setFilteredProfiles([]);
      toast.error('Error fetching UE Profiles.');
    }
  }, [token]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Hàm xóa UE Profile
  const handleDelete = async (supi) => {
    try {
      await axios.delete(`/ue_profiles/${supi}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchProfiles();
      toast.success('UE Profile deleted successfully.');
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Error deleting UE Profile.');
    }
  };

  // Hàm xử lý thay đổi tìm kiếm
  const handleSearchChange = (e) => {
    const supi = e.target.value;
    setSearchSUPI(supi);
    if (supi === '') {
      setFilteredProfiles(profiles);
    } else {
      const filtered = profiles.filter((profile) =>
        profile.supi.toLowerCase().includes(supi.toLowerCase())
      );
      setFilteredProfiles(filtered);
    }
  };

  // Hàm nhóm UE Profiles theo ngày tạo 
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

  const groupedProfiles = groupProfilesByDate(filteredProfiles);

  return (
    <div>
      <Row className="mb-4">
        <Col md={6}>
          <Button variant="primary" onClick={() => setShowGenerateForm(true)}>
            Generate UE Profile(s)
          </Button>
        </Col>
        <Col md={6}>
          <InputGroup>
            <FormControl
              placeholder="Search by SUPI"
              value={searchSUPI}
              onChange={handleSearchChange}
            />
            <Button variant="outline-secondary" onClick={() => setSearchSUPI('')}>
              Clear
            </Button>
          </InputGroup>
        </Col>
      </Row>

      {/* Generation Form Modal */}
      {showGenerateForm && (
        <GenerateUEProfileForm
          onClose={() => setShowGenerateForm(false)}
          refreshProfiles={fetchProfiles}
        />
      )}

      {filteredProfiles && filteredProfiles.length > 0 ? (
        Object.keys(groupedProfiles).map((date) => (
          <div key={date}>
            <h3 className="mt-4 mb-3">{date}</h3>
            <Row>
              {groupedProfiles[date].map((profile) => (
                <Col md={6} lg={4} key={profile.supi} className="mb-4">
                  <Card>
                    <Card.Body>
                      <UEProfileItem
                        profile={profile}
                        onDelete={handleDelete}
                        refreshProfiles={fetchProfiles}
                      />
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        ))
      ) : (
        <p>No UE Profiles found.</p>
      )}
    </div>
  );
}

export default UEProfileList;
