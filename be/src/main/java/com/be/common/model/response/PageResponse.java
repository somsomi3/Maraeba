package com.be.common.model.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class PageResponse<T> {
	private List<T> content;
	private int totalPages;
	private long totalElements;
	private int size;
	private int number;
	private boolean first;
	private boolean last;
}
