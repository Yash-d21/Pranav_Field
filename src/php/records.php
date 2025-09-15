<?php
require_once 'config.php';

setCORSHeaders();
startSession();

function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

if (!isAuthenticated()) {
    sendJsonResponse(['error' => 'Unauthorized'], 401);
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'POST':
        createRecord($input);
        break;
    case 'GET':
        if (isset($_GET['type'])) {
            getRecordsByType($_GET['type']);
        } else {
            getAllRecords();
        }
        break;
    default:
        sendJsonResponse(['error' => 'Method not allowed'], 405);
}

function createRecord($data) {
    if (!isset($data['type'])) {
        sendJsonResponse(['error' => 'Record type required'], 400);
    }

    $user = getCurrentUser();
    $pdo = getDatabaseConnection();

    switch($data['type']) {
        case 'punch_in':
            createPunchInRecord($pdo, $user, $data);
            break;
        case 'corrective_maintenance':
            createCorrectiveMaintenanceRecord($pdo, $user, $data);
            break;
        case 'preventive_maintenance':
            createPreventiveMaintenanceRecord($pdo, $user, $data);
            break;
        case 'change_request':
            createChangeRequestRecord($pdo, $user, $data);
            break;
        case 'gp_live_check':
            createGPLiveCheckRecord($pdo, $user, $data);
            break;
        case 'patroller_task':
            createPatrollerRecord($pdo, $user, $data);
            break;
        default:
            sendJsonResponse(['error' => 'Invalid record type'], 400);
    }
}

function createPunchInRecord($pdo, $user, $data) {
    $recordId = generateUUID();
    
    $stmt = $pdo->prepare("
        INSERT INTO punch_in_records (id, user_id, user_email, name, technician_name, location, punch_in_time, photos, gps_coordinates, notes, priority, status) 
        VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $recordId,
        $user['id'],
        $user['email'],
        $data['technicianName'] ?? $data['name'] ?? '', // Use technicianName if provided, fallback to name
        $data['technicianName'] ?? $data['name'] ?? '', // Use technician_name if provided, fallback to name
        $data['location'],
        isset($data['photos']) ? json_encode($data['photos']) : (isset($data['photo']) ? json_encode([$data['photo']]) : null),
        isset($data['gpsLocation']) ? json_encode($data['gpsLocation']) : (isset($data['gpsCoordinates']) ? json_encode($data['gpsCoordinates']) : null),
        $data['notes'] ?? null,
        $data['priority'] ?? 'medium',
        $data['status'] ?? 'pending'
    ]);
    
    sendJsonResponse(['success' => true, 'id' => $recordId]);
}

function createCorrectiveMaintenanceRecord($pdo, $user, $data) {
    $recordId = generateUUID();
    
    $stmt = $pdo->prepare("
        INSERT INTO corrective_maintenance_records 
        (id, user_id, user_email, location, issue, issue_description, tt_number, damage_reason, restoration_possible_as_per_sla, 
         equipment_id, maintenance_photos, cut_location_photos, gps_coordinates, priority, status, completion_notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $recordId,
        $user['id'],
        $user['email'],
        $data['location'],
        $data['issue'],
        $data['issueDescription'] ?? $data['issue'], // Use issue_description if provided, fallback to issue
        $data['ttNumber'],
        $data['damageReason'],
        $data['restorationPossibleAsPerSLA'] ? 1 : 0,
        $data['equipmentId'] ?? null,
        isset($data['maintenancePhotos']) ? json_encode($data['maintenancePhotos']) : null,
        isset($data['cutLocationPhotos']) ? json_encode($data['cutLocationPhotos']) : null,
        isset($data['gpsLocation']) ? json_encode($data['gpsLocation']) : (isset($data['gpsCoordinates']) ? json_encode($data['gpsCoordinates']) : null),
        $data['priority'] ?? 'medium',
        $data['status'] ?? 'pending',
        $data['completionNotes'] ?? null
    ]);
    
    sendJsonResponse(['success' => true, 'id' => $recordId]);
}

function createPreventiveMaintenanceRecord($pdo, $user, $data) {
    $recordId = generateUUID();
    
    $stmt = $pdo->prepare("
        INSERT INTO preventive_maintenance_records 
        (id, user_id, user_email, mandal_name, location, ring_name, no_of_gps, otdr_testing_from_location, 
         otdr_testing_to_location, gp_span_name, fiber_tests) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $recordId,
        $user['id'],
        $user['email'],
        $data['location'] ?? 'N/A', // Use location as mandal_name for now
        $data['location'],
        'N/A', // ring_name
        0, // no_of_gps
        $data['equipmentId'] ?? 'N/A', // otdr_testing_from_location
        $data['maintenanceType'] ?? 'N/A', // otdr_testing_to_location
        $data['maintenanceDescription'] ?? 'N/A', // gp_span_name
        json_encode([
            'maintenanceType' => $data['maintenanceType'],
            'maintenanceDescription' => $data['maintenanceDescription'],
            'priority' => $data['priority'],
            'status' => $data['status'],
            'completionNotes' => $data['completionNotes'],
            'gpsLocation' => $data['gpsLocation'],
            'photos' => $data['photos']
        ])
    ]);
    
    sendJsonResponse(['success' => true, 'id' => $recordId]);
}

function createChangeRequestRecord($pdo, $user, $data) {
    $recordId = generateUUID();
    
    $stmt = $pdo->prepare("
        INSERT INTO change_request_records 
        (id, user_id, user_email, mandal_name, ring_name, gp_span_name, change_request_no, 
         reason_for_activity, material_consumed_ofc, material_consumed_poles) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $recordId,
        $user['id'],
        $user['email'],
        $data['location'] ?? 'N/A', // mandal_name
        'N/A', // ring_name
        $data['changeDescription'] ?? 'N/A', // gp_span_name
        $data['requestedBy'] ?? 'N/A', // change_request_no
        $data['changeDescription'] ?? 'N/A', // reason_for_activity
        0.00, // material_consumed_ofc
        0 // material_consumed_poles
    ]);
    
    sendJsonResponse(['success' => true, 'id' => $recordId]);
}

function createGPLiveCheckRecord($pdo, $user, $data) {
    $recordId = generateUUID();
    
    $stmt = $pdo->prepare("
        INSERT INTO gp_live_check_records 
        (id, user_id, user_email, mandal, ring_name, gp_name, fdms_issue, termination_issue, 
         re_location, fiber_issue, issue_details, rack_installed, router_issue, sfp_module, 
         ups_issue, mcb_issue, trough_raw_power_router, apsfl_power_meter_connection) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $recordId,
        $user['id'],
        $user['email'],
        $data['location'] ?? 'N/A', // mandal
        'N/A', // ring_name
        $data['gpName'] ?? 'N/A', // gp_name
        false, // fdms_issue
        false, // termination_issue
        false, // re_location
        false, // fiber_issue
        $data['issuesFound'] ?? 'N/A', // issue_details
        false, // rack_installed
        false, // router_issue
        false, // sfp_module
        false, // ups_issue
        false, // mcb_issue
        false, // trough_raw_power_router
        false // apsfl_power_meter_connection
    ]);
    
    sendJsonResponse(['success' => true, 'id' => $recordId]);
}

function createPatrollerRecord($pdo, $user, $data) {
    $recordId = generateUUID();
    
    $stmt = $pdo->prepare("
        INSERT INTO patroller_records 
        (id, user_id, user_email, mandal_name, location, ring_name, no_of_gps, gp_span_name,
         sag_location_identified, sag_location_photos, clamp_damaged, clamp_damage_photos,
         tension_clamp_count, suspension_clamp_count, new_pole_bend_identified, pole_damage,
         pole_damage_photos, pole_bend_new_poles, pole_bend_photos, loop_stand_issues,
         loop_stand_photos, tree_cutting_activity, tree_cutting_photos, joint_enclosure_problems,
         joint_enclosure_photos, cut_location_identified, cut_location_photos,
         other_activities_description, other_activities_photos) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $recordId,
        $user['id'],
        $user['email'],
        $data['location'] ?? 'N/A', // mandal_name
        $data['location'] ?? 'N/A', // location
        'N/A', // ring_name
        0, // no_of_gps
        $data['taskDescription'] ?? 'N/A', // gp_span_name
        false, // sag_location_identified
        json_encode([]), // sag_location_photos
        false, // clamp_damaged
        json_encode([]), // clamp_damage_photos
        0, // tension_clamp_count
        0, // suspension_clamp_count
        false, // new_pole_bend_identified
        false, // pole_damage
        json_encode([]), // pole_damage_photos
        false, // pole_bend_new_poles
        json_encode([]), // pole_bend_photos
        false, // loop_stand_issues
        json_encode([]), // loop_stand_photos
        false, // tree_cutting_activity
        json_encode([]), // tree_cutting_photos
        false, // joint_enclosure_problems
        json_encode([]), // joint_enclosure_photos
        false, // cut_location_identified
        json_encode([]), // cut_location_photos
        $data['taskDescription'] ?? 'N/A', // other_activities_description
        json_encode($data['photos'] ?? []) // other_activities_photos
    ]);
    
    sendJsonResponse(['success' => true, 'id' => $recordId]);
}

function getAllRecords() {
    $pdo = getDatabaseConnection();
    
    $tableMap = [
        'punch_in_records' => 'Daily Punch-In',
        'corrective_maintenance_records' => 'Corrective Maintenance',
        'preventive_maintenance_records' => 'FRT Daily Activity - Preventive Maintenance',
        'change_request_records' => 'Change Request',
        'gp_live_check_records' => 'GP Live Check',
        'patroller_records' => 'Patroller Task & Observations'
    ];
    
    $allRecords = [];
    
    foreach ($tableMap as $table => $activityType) {
        $stmt = $pdo->query("SELECT * FROM $table ORDER BY created_at DESC");
        $records = $stmt->fetchAll();
        
        // Add activity type and timestamp fields to each record
        foreach ($records as $record) {
            $record['activityType'] = $activityType;
            $record['timestamp'] = $record['created_at'];
            $record['createdAt'] = $record['created_at'];
            $allRecords[] = $record;
        }
    }
    
    // Sort by created_at descending
    usort($allRecords, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });
    
    sendJsonResponse(['records' => $allRecords]);
}

function getRecordsByType($type) {
    $pdo = getDatabaseConnection();
    
    $tableMap = [
        'punch_in' => 'punch_in_records',
        'corrective_maintenance' => 'corrective_maintenance_records',
        'preventive_maintenance' => 'preventive_maintenance_records',
        'change_request' => 'change_request_records',
        'gp_live_check' => 'gp_live_check_records',
        'patroller_task' => 'patroller_records'
    ];
    
    if (!isset($tableMap[$type])) {
        sendJsonResponse(['error' => 'Invalid record type'], 400);
    }
    
    $table = $tableMap[$type];
    $stmt = $pdo->query("SELECT * FROM $table ORDER BY created_at DESC");
    $records = $stmt->fetchAll();
    
    sendJsonResponse(['records' => $records]);
}
?>