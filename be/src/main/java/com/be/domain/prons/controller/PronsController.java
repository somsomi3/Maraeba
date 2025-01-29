package com.be.domain.prons.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.be.domain.prons.dto.PronunciationClassDTO;
import com.be.domain.prons.dto.PronunciationDataDTO;
import com.be.domain.prons.response.GetClassDataRes;
import com.be.domain.prons.response.GetClassesRes;
import com.be.domain.prons.service.PronsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/prons")
public class PronsController {

	private final PronsService pronsService;

	// 발음 수업 카테고리 가져오기
	@GetMapping
	public GetClassesRes getClasses() {
		List<PronunciationClassDTO> classDTOS = pronsService.getClasses();
		return new GetClassesRes("Success", 200, classDTOS);
	}

	// 특정 수업 학습자료 가져오기
	@GetMapping("/{class_id}")
	public GetClassDataRes getClassData(@PathVariable("class_id") Long classId) {
		List<PronunciationDataDTO> dataDTOS = pronsService.getClassData(classId);
		return new GetClassDataRes("Success", 200, dataDTOS);
	}
}
